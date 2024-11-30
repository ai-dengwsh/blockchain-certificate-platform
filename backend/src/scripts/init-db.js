const sequelize = require('../config/database');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');

const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, '../migrations'),
    params: [sequelize.getQueryInterface(), sequelize.constructor],
    pattern: /\.js$/
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Run migrations
    await umzug.up();
    console.log('All migrations have been executed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
