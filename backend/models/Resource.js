const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resource = sequelize.define('Resource', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    s3_key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('NOTES', 'QUESTION_PAPER', 'SOLUTION', 'PROJECT_REPORT', 'STUDY_MATERIAL', 'OTHER'),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    privacy_level: {
        type: DataTypes.ENUM('PUBLIC', 'PRIVATE'),
        defaultValue: 'PUBLIC'
    },
    college: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploader_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'resources',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Resource;
