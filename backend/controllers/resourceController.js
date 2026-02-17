const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');

module.exports = {
    createResource,
    getResources,
    getResourceById,
    downloadResource,
    deleteResource
};
try {
    const { title, description, type, subject, semester, year, privacy_level, tags } = req.body;

    // File from Multer S3
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    const resource = await prisma.resource.create({
        data: {
            title,
            description,
            s3_key: req.file.key,
            file_url: req.file.location, // Public URL if bucket is public, otherwise key is used for signing
            type,
            subject,
            semester: parseInt(semester),
            year: parseInt(year),
            privacy_level,
            college: req.userData.college,
            uploader_id: req.userData.id,
            tags: {
                create: tags ? tags.split(',').map(tag => ({ name: tag.trim() })) : []
            }
        }
    });

    res.status(201).json(resource);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
}
};

// Get All Resources (with filters & access control)
exports.getResources = async (req, res) => {
    try {
        const { type, subject, semester, search } = req.query;
        const user = req.userData; // From auth middleware

        const where = {
            AND: [
                // Filter by Type
                type ? { type } : {},
                // Filter by Subject
                subject ? { subject: { contains: subject, mode: 'insensitive' } } : {},
                // Filter by Semester
                semester ? { semester: parseInt(semester) } : {},
                // Search in Title or Description
                search ? {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                } : {},
                // ACCESS CONTROL LOGIC
                {
                    OR: [
                        { privacy_level: 'PUBLIC' },
                        {
                            AND: [
                                { privacy_level: 'PRIVATE' },
                                { college: user.college }
                            ]
                        }
                    ]
                }
            ]
        };

        const resources = await prisma.resource.findMany({
            where,
            include: {
                uploader: { select: { name: true, college: true } },
                tags: true
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Single Resource
exports.getResourceById = async (req, res) => {
    // Resource is already fetched and attached by accessControl middleware
    res.json(req.resource);
};

// Download Resource (Generate Presigned URL)
exports.downloadResource = async (req, res) => {
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
exports.deleteResource = async (req, res) => {
    try {
        const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });

        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        if (resource.uploader_id !== req.userData.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete from S3 (Optional - good practice)
        // ... S3 delete logic here ...

        await prisma.resource.delete({ where: { id: req.params.id } });

        res.json({ message: 'Resource removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
