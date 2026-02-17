const { Collection, Resource, User, CollectionResource } = require('../models');

// Create a new collection
const createCollection = async (req, res) => {
    try {
        const { title, description, privacy } = req.body;
        const userId = req.userData.id;

        const collection = await Collection.create({
            title,
            description,
            privacy: privacy || 'PRIVATE',
            user_id: userId
        });

        res.status(201).json(collection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get collections (My collections + Public ones)
const getCollections = async (req, res) => {
    try {
        const userId = req.userData.id;
        const { type } = req.query; // 'my' or 'public' or 'all'

        let whereClause = {};

        if (type === 'my') {
            whereClause = { user_id: userId };
        } else if (type === 'public') {
            whereClause = { privacy: 'PUBLIC' };
        } else {
            // My collections OR Public collections
            const { Op } = require('sequelize');
            whereClause = {
                [Op.or]: [
                    { user_id: userId },
                    { privacy: 'PUBLIC' }
                ]
            };
        }

        const collections = await Collection.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name']
                },
                {
                    model: Resource,
                    as: 'resources',
                    attributes: ['id'] // Just need count mostly, or ids
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(collections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get single collection with resources
const getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userData.id;

        const collection = await Collection.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'profile_pic']
                },
                {
                    model: Resource,
                    as: 'resources',
                    include: [{ model: User, as: 'uploader', attributes: ['name'] }]
                }
            ]
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Access Control
        if (collection.privacy === 'PRIVATE' && collection.user_id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(collection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add resource to collection
const addResource = async (req, res) => {
    try {
        const { id } = req.params; // Collection ID
        const { resourceId } = req.body;
        const userId = req.userData.id;

        const collection = await Collection.findByPk(id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if resource exists
        const resource = await Resource.findByPk(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Add to junction
        await collection.addResource(resource);

        res.json({ message: 'Resource added to collection' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Remove resource from collection
const removeResource = async (req, res) => {
    try {
        const { id, resourceId } = req.params;
        const userId = req.userData.id;

        const collection = await Collection.findByPk(id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const resource = await Resource.findByPk(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        await collection.removeResource(resource);

        res.json({ message: 'Resource removed from collection' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete collection
const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userData.id;

        const collection = await Collection.findByPk(id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await collection.destroy();

        res.json({ message: 'Collection deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createCollection,
    getCollections,
    getCollectionById,
    addResource,
    removeResource,
    deleteCollection
};
