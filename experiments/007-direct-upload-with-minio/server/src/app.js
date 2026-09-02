import express from "express";
import cors from "cors";

import uploadRoutes from "./routes/upload.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.post("/test", (req, res) => {
    res.json({
        message: "POST works",
        body: req.body,
    });
});

app.use("/api/uploads", uploadRoutes);

export default app;