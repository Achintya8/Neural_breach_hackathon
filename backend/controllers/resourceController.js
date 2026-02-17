const { Resource, Tag, User, Review } = require('../models');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const { Op } = require('sequelize');

// Create Resource
const createResource = async (req, res) => {
    try {
        const { title, description, type, subject, semester, year, privacy_level, branch, tags } = req.body;

        // File from Multer S3
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const resource = await Resource.create({
            title,
            description,
            s3_key: req.file.key,
            file_url: req.file.location,
            type,
            subject,
            semester: parseInt(semester),
            year: parseInt(year),
            privacy_level,
            branch,
            college: req.userData.college || 'Unknown',
            uploader_id: req.userData.id
        });

        // Handle tags if provided
        if (tags) {
            const tagNames = tags.split(',').map(tag => tag.trim());
            const tagInstances = await Promise.all(
                tagNames.map(name => Tag.findOrCreate({ where: { name } }))
            );
            await resource.setTags(tagInstances.map(([tag]) => tag));
        }

        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Resources (with filters & access control)
const getResources = async (req, res) => {
    try {
        const { type, subject, semester, search, privacy_level, sort, branch } = req.query;
        const user = req.userData;

        const where = {
            [Op.and]: [
                type ? { type } : {},
                subject ? { subject: { [Op.like]: `%${subject}%` } } : {},
                semester ? { semester: parseInt(semester) } : {},
                branch ? { branch } : {},
                privacy_level ? { privacy_level } : {},
                search ? {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { subject: { [Op.like]: `%${search}%` } }
                    ]
                } : {},
                {
                    [Op.or]: [
                        { privacy_level: 'PUBLIC' },
                        {
                            [Op.and]: [
                                { privacy_level: 'PRIVATE' },
                                { college: user.college }
                            ]
                        }
                    ]
                }
            ]
        };

        let order = [['created_at', 'DESC']]; // Default: Latest
        if (sort === 'popular') {
            order = [['views', 'DESC'], ['downloads', 'DESC']];
        } else if (sort === 'oldest') {
            order = [['created_at', 'ASC']];
        }
        // 'rated' sorting will be handled after fetching because avgRating is computed

        const resources = await Resource.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['name', 'college']
                },
                {
                    model: Tag,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: Review,
                    as: 'reviews',
                    attributes: ['rating']
                }
            ],
            order
        });

        // Calculate average rating and flatten
        let resourcesWithRating = resources.map(res => {
            const resource = res.toJSON();
            const totalRating = resource.reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = resource.reviews.length > 0 ? (totalRating / resource.reviews.length).toFixed(1) : 0;
            delete resource.reviews;
            return {
                ...resource,
                avgRating: parseFloat(avgRating),
                reviewCount: res.reviews.length
            };
        });

        // Handle 'highest rated' sort in memory
        if (sort === 'rated') {
            resourcesWithRating.sort((a, b) => b.avgRating - a.avgRating);
        }

        res.json(resourcesWithRating);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add Review
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const resourceId = req.params.id;
        const userId = req.userData.id;

        // Check if user already reviewed
        const existingReview = await Review.findOne({
            where: { user_id: userId, resource_id: resourceId }
        });

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
            await existingReview.save();
            return res.json(existingReview);
        }

        const review = await Review.create({
            rating,
            comment,
            user_id: userId,
            resource_id: resourceId
        });

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Reviews for a Resource
const getReviews = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const reviews = await Review.findAll({
            where: { resource_id: resourceId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Single Resource
const getResourceById = async (req, res) => {
    // Resource is already fetched and attached by accessControl middleware
    // We should increment views here
    try {
        await req.resource.increment('views');
        // Fetch updated resource or manually update the property to return immediately
        req.resource.views += 1;
        res.json(req.resource);
    } catch (err) {
        console.error("Error incrementing views:", err);
        res.json(req.resource); // Return resource anyway
    }
};

// Preview Resource (Generate Presigned URL for inline view)
const previewResource = async (req, res) => {
    try {
        const resource = req.resource; // From accessControl middleware

        let contentType = 'application/octet-stream';
        const ext = resource.s3_key.split('.').pop().toLowerCase();
        if (ext === 'pdf') contentType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'txt') contentType = 'text/plain';

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: resource.s3_key,
            ResponseContentDisposition: 'inline', // Forces browser to try opening it
            ResponseContentType: contentType
        });

        // Generate signed URL valid for 1 hour
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Do NOT increment downloads for preview

        res.json({ previewUrl: url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating preview link' });
    }
};

// Download Resource (Generate Presigned URL)
const downloadResource = async (req, res) => {
    try {
        const resource = req.resource; // From accessControl middleware

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: resource.s3_key,
            ResponseContentDisposition: 'attachment' // Forces download
        });

        // Generate signed URL valid for 1 hour
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Increment downloads
        await resource.increment('downloads');

        res.json({ downloadUrl: url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating download link' });
    }
};

// Get My Resources
const getMyResources = async (req, res) => {
    try {
        const userId = req.userData.id;
        const resources = await Resource.findAll({
            where: { uploader_id: userId },
            include: [
                {
                    model: Tag,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: Review,
                    as: 'reviews',
                    attributes: ['rating']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const resourcesWithRating = resources.map(res => {
            const resource = res.toJSON();
            const totalRating = resource.reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = resource.reviews.length > 0 ? (totalRating / resource.reviews.length).toFixed(1) : 0;
            delete resource.reviews;
            return { ...resource, avgRating, reviewCount: res.reviews.length };
        });

        res.json(resourcesWithRating);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Resource
const updateResource = async (req, res) => {
    try {
        const { title, description, privacy_level, tags } = req.body;
        const resource = await Resource.findByPk(req.params.id);

        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.uploader_id !== req.userData.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        resource.title = title || resource.title;
        resource.description = description || resource.description;
        resource.privacy_level = privacy_level || resource.privacy_level;
        await resource.save();

        if (tags) {
            const tagNames = tags.split(',').map(tag => tag.trim());
            const tagInstances = await Promise.all(
                tagNames.map(name => Tag.findOrCreate({ where: { name } }))
            );
            await resource.setTags(tagInstances.map(([tag]) => tag));
        }

        res.json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete Resource (Only by uploader)
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);

        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.uploader_id !== req.userData.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete from S3 (Optional - good practice)
        // ... S3 delete logic here ...

        await resource.destroy();

        res.json({ message: 'Resource removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createResource,
    getResources,
    getResourceById,
    previewResource,
    downloadResource,
    deleteResource,
    addReview,
    getReviews,
    getMyResources,
    updateResource
};
