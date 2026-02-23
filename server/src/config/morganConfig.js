// config/morganConfig.js
import morgan from "morgan";
import logger from "./logger.js";

const morganStream = {
  write: message => {
    // Non-blocking log — push to next tick
    setImmediate(() => {
      logger.info(message.trim());
    });
  }
};

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";

const morganConfig =
  process.env.NODE_ENV === "production"
    ? morgan(morganFormat, { stream: morganStream })
    : morgan(morganFormat); // use console for dev

export default morganConfig;
export { morganConfig };
