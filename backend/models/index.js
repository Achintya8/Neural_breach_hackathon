const sequelize = require('../config/database');
const User = require('./User');
const Resource = require('./Resource');
const Tag = require('./Tag');

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
    syncDatabase
};
