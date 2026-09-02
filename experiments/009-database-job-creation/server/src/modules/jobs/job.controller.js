import * as jobService from "./job.service.js";

export async function createJob(req, res) {
    const job = await jobService.createJob(req.body);

    res.status(201).json(job);
}

export async function getJob(req, res) {
    const job = await jobService.findJobById(
        Number(req.params.id)
    );

    if (!job) {
        return res.status(404).json({
            message: "Job not found",
        });
    }

    res.json(job);
}