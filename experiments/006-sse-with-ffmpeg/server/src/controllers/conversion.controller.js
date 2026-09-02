import {randomUUID} from "crypto";

import {
    createJob, getJob, updateJob, setClient, getClient, removeClient
} from "../jobs/job.store.js";

import {
    getAudioDuration, convertAudio
} from "../services/ffmpeg.service.js";

export async function convert(req, res) {
    try {
        const inputPath = req.file.path;
        const format = req.body.format;

        const jobId = randomUUID();

        const duration = await getAudioDuration(inputPath);

        const outputPath = `uploads/output/${jobId}.${format}`;


        const job = createJob({
            id: jobId, inputPath, outputPath, format, status: "processing", progress: 0
        });

        convertAudio({
            inputPath, outputPath, duration,

            onProgress(progress) {
                updateJob(jobId, {
                    progress
                });

                sendProgress(jobId, progress);
            },

            onComplete() {
                updateJob(jobId, {
                    status: "completed", progress: 100
                });

                sendCompleted(jobId);
            },

            onError(error) {
                console.error(error);

                updateJob(jobId, {
                    status: "failed"
                });

                sendError(jobId, "FFmpeg conversion failed.");
            }
        });

        res.json({
            jobId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to start conversion."
        });
    }
}

export function progress(req, res) {
    const {jobId} = req.params;

    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({
            message: "Job not found"
        });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    setClient(jobId, res);

    sendProgress(jobId, job.progress);

    req.on("close", () => {
        removeClient(jobId);
    });
}

export function download(req, res) {
    const {jobId} = req.params;

    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({
            message: "Job not found"
        });
    }

    if (job.status !== "completed") {
        return res.status(400).json({
            message: "Conversion is not completed yet"
        });
    }

    res.download(job.outputPath);
}

function sendProgress(jobId, progress) {
    const client = getClient(jobId);

    if (!client) {
        return;
    }

    client.write(
        `event: progress\n`
    );

    client.write(
        `data: ${JSON.stringify({ progress })}\n\n`
    );
}

function sendCompleted(jobId) {
    const client = getClient(jobId);

    if (!client) {
        return;
    }

    client.write(
        `event: progress\n`
    );

    client.write(
        `data: ${JSON.stringify({ progress: 100 })}\n\n`
    );


    client.write(
        `event: completed\n`
    );

    client.write(
        `data: ${JSON.stringify({ jobId })}\n\n`
    );
}

function sendError(jobId, message) {
    const client = getClient(jobId);

    if (!client) {
        return;
    }

    client.write(
        `event: error\n`
    );

    client.write(
        `data: ${JSON.stringify({ message })}\n\n`
    );
}