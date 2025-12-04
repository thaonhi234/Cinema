import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// Only login route for now
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
    console.log("Backend chạy tại http://localhost:3000");
});
