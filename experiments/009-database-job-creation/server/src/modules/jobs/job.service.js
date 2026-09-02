import * as jobRepository from "./job.repository.js";

export async function createJob(data) {
    const job = await jobRepository.createJob({
        status: "pending",
    });

    // Later:
    // enqueue job into BullMQ

    return job;
}