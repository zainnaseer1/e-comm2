const express = require("express");
const cors = require("cors");
const path = require("path"); //core module to handle file and directory paths
// const morgan = require("morgan"); //logger
const compression = require("compression");

const ApiError = require("./utils/apiError.js");
const dbConnection = require("./config/database.js");
const globalErrorHandler = require("./middleware/errorMiddleware.js");
const { mountRoutes } = require("./routes"); // will auto use index.js file
const { webhookCheckout } = require("./services/orderService.js");
const isValidSignature = require("./utils/isValidSignature"); // const order = require("./services/orderService");

require("dotenv").config({ path: "config.env" });

//connecting to database
dbConnection();
// Initialize Express app
const app = express();
//enable other domains to access your application
app.use(cors()); // handles CORS + preflight, no explicit app.options needed\
// compress all responses
app.use(compression());

// IMPORTANT: capture raw body for HMAC check
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Checkout webhook
app.post(
  "/webhook-checkout", // the link stripe is listening to so that it do the below action
  express.raw({ type: "application/json" }),
  webhookCheckout,
);

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads"))); // Serve static files from the 'uploads' directory, localhost:3000/folder-path/filename.jpg

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "config.env" });
}

app.post("/github/webhook", (req, res) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET; // set in Render → Environment
  const sig = req.get("X-Hub-Signature-256");

  const ok = isValidSignature(sig, req.rawBody, secret);
  if (!ok) return res.status(401).send("Invalid signature");

  // handle event
  const event = req.get("X-GitHub-Event");
  console.log("GitHub event: ", event);

  if (event.type === "checkout.session.completed")
    console.log("create order here.....");

  res.send("ok");
});

//logger
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
//   console.log(`Logging enabled in ${process.env.NODE_ENV} mode`);
// }

// use the routes from routes/index.js
mountRoutes(app);

app.get("/", (req, res) => res.send("API is running ✅"));
app.get("/healthz", (req, res) => res.send("ok"));

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler for express
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // ← important for containers
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

// async/promises error rejection handler outside express
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.name} - ${err.message}`);
  server.close(() => {
    console.error("Shutting down server due to unhandled rejection...");
    process.exit(1); // Exit the process after closing the server
  });
});
