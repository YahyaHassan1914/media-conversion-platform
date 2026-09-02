import prisma from "../../lib/prisma.js";

export function createJob(data) {
    return prisma.job.create({
        data,
    });
}

export function findJobById(id) {
    return prisma.job.findUnique({
        where: { id },
    });
}

export function findJobs() {
    return prisma.job.findMany();
}