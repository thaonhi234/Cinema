import express from "express";
import cors from "cors";
import "dotenv/config"; // <--- THÊM DÒNG NÀY ĐỂ TẢI FILE .ENV
import authRoutes from "./routes/authRoutes";
//import dashboardRoutes from "./routes/dashboardRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// Only login route for now
app.use("/api/auth", authRoutes);
//app.use("/api/dashboard", dashboardRoutes);

app.listen(3001, () => {
    console.log("Backend chạy tại http://localhost:3001");
});
