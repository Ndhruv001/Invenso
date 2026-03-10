import helmet from "helmet";

const isProduction = process.env.NODE_ENV === "production";

const helmetConfig = () => {
  const config = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  };

  // Enable HSTS only in production (forces HTTPS)
  if (isProduction) {
    config.hsts = {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    };
  }

  return helmet(config);
};

export default helmetConfig;
export { helmetConfig };
