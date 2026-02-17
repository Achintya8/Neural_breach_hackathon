const { sequelize, syncDatabase } = require('./models');

const testSync = async () => {
    try {
        console.log('Testing database sync...');
        await sequelize.authenticate();
        console.log('Database connection OK.');
        await sequelize.sync(); // Try without alter first
        console.log('Sync successful.');
    } catch (error) {
        console.error('Sync failed:', error);
        // Log sql if available
        if (error.sql) {
            console.error('SQL:', error.sql);
        }
    } finally {
        await sequelize.close();
    }
};

testSync();
