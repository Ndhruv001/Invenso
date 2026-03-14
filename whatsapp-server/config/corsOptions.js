// CORS: Configure cross-origin resource sharing
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:5174"
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST",],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

export default corsOptions;
export { corsOptions };
