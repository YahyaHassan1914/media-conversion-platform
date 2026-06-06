const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");

let currentJob = null;

startBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(
            "http://localhost:3000/jobs",
            {
                method: "POST"
            }
        );

        currentJob = await response.json();

        status.textContent = `Job ${currentJob.id} created`;
    } catch {
        status.textContent = "Job failed.";
    }
});

setInterval(async () => {
    if (!currentJob) {
        return;
    }

    const response = await fetch(
        `http://localhost:3000/jobs/${currentJob.id}`
    );

    const jobStatus = await response.json();

    status.textContent = `Status: ${jobStatus.status}`;
}, 1000);