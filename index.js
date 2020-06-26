const pino = require('./pino');
const logger=pino();

logger.info("INFO");
logger.warn("WARN");
logger.error("ERROR");
