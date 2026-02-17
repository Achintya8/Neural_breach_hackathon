const { Resource, User } = require('../models');

module.exports = async (req, res, next) => {
    try {
        const user = req.userData; // From auth middleware
        const resourceId = req.params.id;
        const resource = await Resource.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['name', 'college', 'profile_pic'] // Include profile_pic too
                }
            ]
        });

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // If resource is public, allow access
        if (resource.privacy_level === 'PUBLIC') {
            req.resource = resource;
            return next();
        }

        // If private, check college match
        if (resource.college && user.college !== resource.college) {
            return res.status(403).json({ message: 'Access denied: This resource is private to ' + resource.college });
        }

        req.resource = resource;
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
