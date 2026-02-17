const sequelize = require('../config/database');
const User = require('./User');
const Resource = require('./Resource');
const Tag = require('./Tag');
const Review = require('./Review');

// Define associations
User.hasMany(Resource, {
    foreignKey: 'uploader_id',
    as: 'resources'
});

Resource.belongsTo(User, {
    foreignKey: 'uploader_id',
    as: 'uploader'
});

// Many-to-Many relationship between Resource and Tag
Resource.belongsToMany(Tag, {
    through: 'resource_tags',
    timestamps: false
});

Tag.belongsToMany(Resource, {
    through: 'resource_tags',
    timestamps: false
});

// Review Associations
User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews'
});

Review.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Resource.hasMany(Review, {
    foreignKey: 'resource_id',
    as: 'reviews'
});

Review.belongsTo(Resource, {
    foreignKey: 'resource_id',
    as: 'resource'
});

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true }); // Use alter to update existing tables
        console.log('✓ Database synced successfully');
    } catch (error) {
        console.error('✗ Database sync failed:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Resource,
    Tag,
    Review,
    syncDatabase
};
