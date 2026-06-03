import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

app.use(cors());

const upload = multer({
    dest: "uploads/"
});

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        });
    }

    res.json({
        message: "Upload successful",
        filename: req.file.filename,
        originalName: req.file.originalname
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});