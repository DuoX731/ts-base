import logger from "@common/util/logger";

// import { User } from "./common/models/collection";

logger.log("This is a log message");
logger.info("This is an info message");
logger.error("This is an error message");
logger.warn("This is a warning message");
logger.debug("This is a debug message");
// setTimeout(() => {
//     User.save({ name: 'test' })
// }, 4000)

logger.log("This is a log message", "lol");