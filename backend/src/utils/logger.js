// Minimal structured logger. Swap out for pino/winston in production.
const levels = ['error', 'warn', 'info', 'debug'];

function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
}

const logger = {};
levels.forEach((level) => {
  logger[level] = (message, meta) => log(level, message, meta);
});

module.exports = logger;
