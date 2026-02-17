const { Discussion, User } = require('../models');

// Add a comment or reply
const addComment = async (req, res) => {
    try {
        const { content, is_anonymous, parent_id } = req.body;
        const resourceId = req.params.id;
        const userId = req.userData.id;

        const discussion = await Discussion.create({
            content,
            is_anonymous: is_anonymous || false,
            parent_id: parent_id || null, // If parent_id is provided, it's a reply
            resource_id: resourceId,
            user_id: userId
        });

        // Fetch the created discussion with user details to return immediately
        const createdDiscussion = await Discussion.findByPk(discussion.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profile_pic', 'college']
            }]
        });

        res.status(201).json(createdDiscussion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all comments for a resource
const getComments = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const comments = await Discussion.findAll({
            where: { resource_id: resourceId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profile_pic', 'college']
            }],
            order: [['created_at', 'ASC']] // Oldest first is usually better for forums, or threaded in UI
        });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.userData.id;

        const comment = await Discussion.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the owner
        if (comment.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Optional: Check if it has replies and handle them (cascade delete or block)
        // Sequelize 'onDelete: CASCADE' usually handles this if configured, or we can check manually.
        // For now, let's just destroy.

        await comment.destroy();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addComment,
    getComments,
    deleteComment
};
