import express from "express";
import crypto from "crypto";

import {createPresignedUploadUrl} from "../services/minio.service.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {filename, contentType} = req.body;

        if (!filename || !contentType) {
            return res.status(400).json({
                message: "Missing filename or content type"
            });
        }

        const uploadId = crypto.randomUUID();

        const objectName = `uploads/${uploadId}/${filename}`;

        const uploadUrl = await createPresignedUploadUrl(objectName);

        res.json({
            uploadId,
            objectName,
            uploadUrl,
        });
    } catch (error) {
        console.error("Failed to initialize upload:", error);

        res.status(500).json({
            message: "Failed to initialize upload",
        });
    }
})

export default router;