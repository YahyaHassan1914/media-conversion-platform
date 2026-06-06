import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

const jobs = [];

app.post("/jobs", (req, res) => {
    const job = {
        id: crypto.randomUUID(),
        status: "pending"
    };

    jobs.push(job);

    processJob(job);

    res.status(201).json(job);
})

app.get("/jobs/:id", (req, res) => {
    const job = jobs.find(
        job => job.id === req.params.id
    );

    if (!job) {
        return res
            .status(404)
            .json({ message: "Job not found" });
    }

    res.json(job);
});

function processJob(job) {
    job.status = "processing";

    setTimeout(() => {
        job.status = "completed";
    }, 5000);
}

app.listen(3000, () => console.log("Server running on http://localhost:3000"));