import compression from "compression";

const compressionConfig = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

export default compressionConfig;
export { compressionConfig };
