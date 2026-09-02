import express from "express";
import multer from "multer";

import {
    convert,
    progress,
    download
} from "../controllers/conversion.controller.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/input/"
});

router.post(
    "/convert",
    upload.single("audio"),
    convert
);

router.get(
    "/progress/:jobId",
    progress
);

router.get(
    "/download/:jobId",
    download
);

export default router;