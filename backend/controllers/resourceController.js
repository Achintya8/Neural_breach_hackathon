const { Resource, Tag, User } = require('../models');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const { Op } = require('sequelize');

// Create Resource
const createResource = async (req, res) => {
    try {
        const { title, description, type, subject, semester, year, privacy_level, tags } = req.body;

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
        const { type, subject, semester, search } = req.query;
        const user = req.userData;

        const where = {
            [Op.and]: [
                type ? { type } : {},
                subject ? { subject: { [Op.iLike]: `%${subject}%` } } : {},
                semester ? { semester: parseInt(semester) } : {},
                search ? {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${search}%` } },
                        { description: { [Op.iLike]: `%${search}%` } }
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
                    attributes: ['id', 'name']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Single Resource
const getResourceById = async (req, res) => {
    // Resource is already fetched and attached by accessControl middleware
    res.json(req.resource);
};

// Download Resource (Generate Presigned URL)
const downloadResource = async (req, res) => {
    try {
        const resource = req.resource; // From accessControl middleware

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: resource.s3_key,
        });

        // Generate signed URL valid for 1 hour
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ downloadUrl: url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating download link' });
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
    downloadResource,
    deleteResource
};
