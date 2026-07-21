import express from "express";
import cors from "cors";
import {Worker} from "worker_threads";
import path from "path";
import {fileURLToPath} from "url";

import {jobs} from "./jobs.js";
import {clients} from "./clients.js";

const app = express();

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const worker = new Worker(path.join(__dirname, "worker.js"));

app.post("/jobs", (req, res) => {
    const id = crypto.randomUUID();

    const job = {
        id,
        progress: 0,
        status: "queued",
    };

    jobs.set(id, job);

    worker.postMessage({
        type: "start",
        job,
    });

    res.status(201).json(job);
});

app.get("/jobs/:id/events", (req, res) => {
    const {id} = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!clients.has(id)) {
        clients.set(id, new Set());
    }

    clients.get(id).add(res);

    req.on("close", () => {
            clients.get(id)?.delete(res);
        }
    );
});

app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
);

worker.on("message", (message) => {
    const job = jobs.get(message.jobId);

    if (!job) {
        return;
    }

    switch (message.type) {
        case "progress":
            job.progress = message.progress;
            job.status = "processing";
            break;

        case "complete":
            job.progress = 100;
            job.status = "completed";
            break;
    }

    notifyClients(job);
})

function notifyClients(job) {
    const listeners = clients.get(job.id);

    if (!listeners) {
        return;
    }

    for (const client of listeners) {
        client.write(`data: ${JSON.stringify(job)}\n\n`);

        if (job.status === "completed") {
            client.write(`event: complete\n`);
            client.write(`data: done\n\n`);
            client.end();
        }
    }

    if (job.status === "completed") {
        clients.delete(job.id);
    }
}
