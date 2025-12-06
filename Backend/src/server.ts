import express from "express";
import cors from "cors";
import "dotenv/config"; // <--- THÊM DÒNG NÀY ĐỂ TẢI FILE .ENV
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import movieRoutes from "./routes/movieRoute";
import roomRoutes from "./routes/roomRoutes";
const app = express();
app.use(cors());
app.use(express.json());

// Only login route for now
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/rooms", roomRoutes);
app.listen(3001, () => {
    console.log("Backend chạy tại http://localhost:3001");
});
