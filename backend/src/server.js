require('dotenv').config();
const db = require('./config/db'); // initializes schema on startup
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

function ensureSeedData() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM employees').get().count;
  if (count === 0) {
    logger.info('No employees found; seeding demo accounts');
    require('./seed');
  }
}

ensureSeedData();

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, { env: process.env.NODE_ENV || 'development' });
});
