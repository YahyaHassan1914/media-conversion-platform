const jobs = new Map();
const clients = new Map();


export function createJob(job) {
    jobs.set(job.id, job);

    return job;
}

export function getJob(jobId) {
    return jobs.get(jobId);
}

export function updateJob(jobId, updates) {
    const job = jobs.get(jobId);

    if (!job) {
        return null;
    }

    Object.assign(job, updates);

    return job;
}

export function setClient(jobId, response) {
    clients.set(jobId, response);
}

export function getClient(jobId) {
    return clients.get(jobId);
}

export function removeClient(jobId) {
    clients.delete(jobId);
}