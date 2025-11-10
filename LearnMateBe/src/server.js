const express = require("express");
const configViewEngine = require("./config/ViewEngine");
const cors = require("cors");
require("dotenv").config();
const connection = require("./config/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const socketHandler = require("./socket/socket");
const doLoginWGoogle = require("./controller/social/GoogleController");
const http = require("http");
const learnerRouter = require("./routes/learnerRoutes");
const socketIo = require("socket.io");
const { RouteAuth } = require("./routes/AuthRoutes");
const RouterTutor = require("./routes/tutorRoutes");
const RouteBooking = require("./routes/BookingRoutes");
const RouterAdmin = require("./routes/adminRoutes");
const RouteMessage = require("./routes/messageRoutes");

const quizRouter = require("./routes/quizRoutes");
const assignmentRouter = require("./routes/assignmentRoutes");
const courseRouter = require("./routes/courseRoutes");
const aiRouter = require("./routes/aiRoutes");

const RoutePayment = require("./routes/PaymentRoutes");

const app = express();
const port = process.env.PORT || 8888;
const hostname = process.env.HOST_NAME || "localhost";
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
// Configure request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure session middleware
app.use(
  session({
    secret: "your-secret-key", // Replace with your secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session()); // Enable passport session support

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:6161",
    credentials: true,
  })
);

// Use your view engine configuration if rendering views
configViewEngine(app);

app.use("/api/learner", learnerRouter);
app.use("/", RouteAuth);
app.use("/api/tutor", RouterTutor);
app.use("/api/booking", RouteBooking);
app.use("/api/message", RouteMessage);
app.use("/api/payment", RoutePayment);
app.use("/api/admin", RouterAdmin);

// ducns
app.use("/api/quizzes", quizRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/courses", courseRouter);
app.use("/api/ai", aiRouter);
// -----

app.get("/", (req, res) => {
  res.json("Hello");
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
socketHandler(io);
(async () => {
  try {
    await connection();
    doLoginWGoogle();
    require("./cron/autoCancelPendingBookings");
    server.listen(port, () => {
      console.log(`Backend + Socket listening on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();
