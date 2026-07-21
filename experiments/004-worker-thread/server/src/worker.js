import {parentPort} from "worker_threads";

parentPort.on("message", (message) => {
    if (message.type !== "start") {
        return;
    }

    const {job} = message;

    let progress = 0;

    const interval = setInterval(() => {
        progress += 10;

        parentPort.postMessage({
            type: "progress",
            jobId: job.id,
            progress,
        });

        if (progress >= 100) {
            clearInterval(interval);

            parentPort.postMessage({
                type: "complete",
                jobId: job.id,
            });
        }
    }, 1000);
});
