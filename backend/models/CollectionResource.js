const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CollectionResource = sequelize.define('CollectionResource', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    collection_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'collections',
            key: 'id'
        }
    },
    resource_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'resources',
            key: 'id'
        }
    }
}, {
    tableName: 'collection_resources',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // We only care when it was added
});

module.exports = CollectionResource;
