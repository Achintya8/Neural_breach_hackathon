const sequelize = require('../config/database');
const User = require('./User');
const Resource = require('./Resource');
const Tag = require('./Tag');
const Review = require('./Review');
const Discussion = require('./Discussion');

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

// Discussion Associations
User.hasMany(Discussion, {
    foreignKey: 'user_id',
    as: 'discussions'
});

Discussion.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Resource.hasMany(Discussion, {
    foreignKey: 'resource_id',
    as: 'discussions'
});

Discussion.belongsTo(Resource, {
    foreignKey: 'resource_id',
    as: 'resource'
});

Discussion.hasMany(Discussion, {
    foreignKey: 'parent_id',
    as: 'replies'
});

Discussion.belongsTo(Discussion, {
    foreignKey: 'parent_id',
    as: 'parent'
});

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
    try {
        await sequelize.sync(); // Remove alter: true to avoid 'Too many keys' error on Users table
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
    Discussion,
    syncDatabase
};
