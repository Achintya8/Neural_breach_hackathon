const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user to request
        req.user = decoded;

        // Check if user still exists in DB
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        // Attach full user object for access control middleware
        req.userData = user;

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
