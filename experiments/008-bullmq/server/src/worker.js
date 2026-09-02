import { Worker } from "bullmq";
import { redisConnection } from "./redis.js";

const worker = new Worker(
    "task-queue",

    async (job) => {
        console.log("Processing job:", job.id);
        console.log("Job name:", job.name);
        console.log("Job data:", job.data);

        // Simulate expensive work
        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });

        console.log("Job finished:", job.id);

        return {
            success: true,
            message: "Task completed",
        };
    },

    {
        connection: redisConnection,
    }
);

worker.on("completed", (job, result) => {
    console.log("Completed:", job.id);
    console.log("Result:", result);
});

worker.on("failed", (job, error) => {
    console.error(
        "Failed:",
        job?.id,
        error.message
    );
});

worker.on("error", (error) => {
    console.error("Worker error:", error);
});

console.log("Task worker started...");