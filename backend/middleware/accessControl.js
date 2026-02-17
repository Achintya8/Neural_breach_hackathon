const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const user = req.userData; // Attached by auth middleware

        const resource = await prisma.resource.findUnique({
            where: { id: resourceId }
        });

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if resource is public
        if (resource.privacy_level === 'PUBLIC') {
            req.resource = resource;
            return next();
        }

        // If private, check college match
        if (user.college === resource.college) {
            req.resource = resource;
            return next();
        }

        return res.status(403).json({ message: 'Access denied: This resource is private to ' + resource.college });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
