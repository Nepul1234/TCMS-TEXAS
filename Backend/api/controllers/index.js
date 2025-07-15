import express from "express";
import cors from "cors";
import quizRoutes from "./routes/quiz.routes.js";
import authrouter from "./routes/auth.routes.js";
import quizAnalyticsRoutes from "./routes/quiz.analytics.routes.js"; // Adjust path according to your project structure
import quizStudentRoutes from "./routes/quiz.stu.routes.js"; // Adjust path according to your project structure
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use("/api/auth", authrouter);

app.get("/test", (req, res) => {
  res.send("Hello world");
});

app.use("/api", quizRoutes);

app.use('/api/quiz-analytics', quizAnalyticsRoutes);

app.use('/api/quiz', quizStudentRoutes);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});