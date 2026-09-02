import express from "express";
import cors from "cors";
import multer from "multer";
import {randomUUID} from "crypto";

import {execFile, spawn} from "child_process";

const jobs = new Map();
const clients = new Map();

const app = express();

app.use(cors());

const upload = multer({
    dest: "uploads/input/"
});

app.post("/convert", upload.single("audio"), async (req, res) => {
    const inputPath = req.file.path;
    const format = req.body.format;

    const jobId = randomUUID();

    const duration = await getAudioDuration(inputPath);
    // console.log(`Audio duration: ${duration} seconds`);

    const outputPath = `uploads/output/${jobId}.${format}`;

    const job = {
        id: jobId,
        inputPath,
        outputPath,
        format,
        status: "processing",
        progress: 0
    };

    jobs.set(jobId, job);

    const ffmpeg = spawn("ffmpeg", [
        "-i",
        inputPath,
        "-progress",
        "pipe:1",
        "-nostats",
        outputPath
    ]);

    ffmpeg.stderr.on("data", (data) => {
        // console.error(`FFmpeg Error: ${data}`);
    });

    ffmpeg.stdout.on("data", (data) => {
        const output = data.toString();

        const lines = output.split("\n");

        for (const line of lines) {
            if (line.startsWith("out_time_ms=")) {
                const outTimeMs = Number(
                    line.split("=")[1]
                );

                const currentTime = outTimeMs / 1_000_000;

                const progress = Math.min(
                    100,
                    Math.round((currentTime / duration) * 100)
                );

                job.progress = progress;

                console.log(`Progress: ${progress}%`);

                const client = clients.get(jobId);

                if (client) {
                    client.write(`event: progress\n`);
                    client.write(
                        `data: ${JSON.stringify({progress})}\n\n`
                    );
                }
            }
        }
    });

    ffmpeg.on("close", (code) => {
        const client = clients.get(jobId);

        if (code === 0) {
            job.status = "completed";
            job.progress = 100;

            if (client) {
                client.write(`event: progress\n`);
                client.write(
                    `data: ${JSON.stringify({progress: 100})}\n\n`
                );

                client.write(`event: completed\n`);
                client.write(
                    `data: ${JSON.stringify({jobId})}\n\n`
                );
            }
        } else {
            job.status = "failed";

            if (client) {
                client.write(`event: error\n`);
                client.write(
                    `data: ${JSON.stringify({
                        message: "FFmpeg conversion failed"
                    })}\n\n`
                );
            }
        }
    });

    res.json({
        jobId
    });
});

app.get("/progress/:jobId", (req, res) => {
    const {jobId} = req.params;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({message: "Job not found"});
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    clients.set(jobId, res);

    res.write(`event: progress\n`);
    res.write(`data: ${JSON.stringify({progress: job.progress})}\n\n`);

    req.on("close", () => {
        clients.delete(jobId);
    });
});

app.get("/download/:jobId", (req, res) => {
    const {jobId} = req.params;

    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({message: "Job not found"});
    }

    if (job.status !== "completed") {
        return res.status(400).json({
            message: "Conversion is not completed yet"
        });
    }

    res.download(job.outputPath);
});

function getAudioDuration(inputPath) {
    return new Promise((resolve, reject) => {
        execFile(
            "ffprobe",
            [
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                inputPath
            ],
            (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(parseFloat(stdout));
            }
        );
    });
}

export default app;


// import express from "express";
// import cors from "cors";
//
// import conversionRoutes from "./routes/conversion.routes.js";
//
// const app = express();
//
// app.use(cors());
//
// app.use("/", conversionRoutes);
//
// export default app;