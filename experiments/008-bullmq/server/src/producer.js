import { taskQueue } from "./task.queue.js";

async function addJob() {
    const job = await taskQueue.add("example-task", {
        name: "Yahya",
        message: "Hello from BullMQ",
    });

    console.log("Job added!");
    console.log("Job ID:", job.id);
}

addJob()
    .catch((error) => {
        console.error("Failed to add job:", error);
    })
    .finally(async () => {
        await taskQueue.close();
    });