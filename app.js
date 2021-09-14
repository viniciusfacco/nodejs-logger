const logger = require('./logger');

function testing(){
    logger.info("this is a info message")
    logger.debug("this is a debug message")
    logger.warn("this is a warn message")
    logger.warning("this is a warning message")
    logger.error("this is a error message")
}

testing()