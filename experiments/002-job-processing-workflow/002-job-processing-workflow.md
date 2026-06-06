---
title: Job Processing Workflow Experiment
experiment: 002
status: completed
difficulty: beginner
---

# 002 - Job Processing Workflow

## Overview

This experiment explores the fundamental job processing workflow that will be used throughout the Media Conversion
Platform.

The goal is to verify that a client can create a job, track its status, and observe its lifecycle as it moves through
the system.

This experiment introduces the concept of asynchronous processing and establishes the foundation for future queue and
worker implementations.

---

## Objectives

* Learn how jobs are created and tracked.
* Understand the difference between creating work and performing work.
* Model a simple job lifecycle.
* Store job information in memory.
* Track job status through an API.
* Learn how clients can monitor long-running operations.
* Understand the workflow before introducing queues, workers, and background processing systems.

---

## Architecture

```text
Browser
    │
    │ POST /jobs
    │
    ▼
Express API
    │
    │ Create Job
    │
    ▼
In-Memory Job Store
    │
    │ Process Job
    │
    ▼
Status Updates
    │
    │ GET /jobs/:id
    │
    ▼
Browser
```

---

## Project Structure

```text
002-job-processing-workflow/
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── src/
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

## Workflow

1. User clicks the "Start Job" button.
2. Client sends a request to create a new job.
3. Server generates a unique job identifier.
4. Job is stored in memory with a `pending` status.
5. Server begins processing the job.
6. Job status changes to `processing`.
7. Client periodically requests job updates.
8. Processing completes after a delay.
9. Job status changes to `completed`.
10. Client displays the updated status.

---

## Technologies

### Frontend

* HTML
* CSS
* JavaScript
* Fetch API

### Backend

* Node.js
* Express
* CORS

---

## Key Concepts

### 1. Jobs

A job represents a unit of work that needs to be performed.

Rather than executing work immediately during a request, the system creates a job that describes the work to be
completed.

Example:

```json
{
  "id": "123",
  "status": "pending"
}
```

The job acts as a record that can be tracked throughout its lifecycle.

---

### 2. Job Lifecycle

Each job progresses through a series of states.

```text
pending
    │
    ▼
processing
    │
    ▼
completed
```

In future experiments additional states may be introduced:

```text
failed
cancelled
retrying
```

Tracking job status allows clients to monitor long-running operations without waiting for a single request to complete.

---

### 3. Polling

Polling is a technique where a client repeatedly requests updated information from a server.

Example:

```js
setInterval(async () => {
    const response = await fetch(
        `/jobs/${jobId}`
    );

    const job = await response.json();

    console.log(job.status);
}, 1000);
```

In this experiment the browser checks the job status every second until processing is complete.

Polling is one of the simplest approaches for monitoring asynchronous work.

---

### 4. Simulated Processing

The experiment uses `setTimeout()` to simulate a long-running operation.

```js
function processJob(job) {
    job.status = "processing";

    setTimeout(() => {
        job.status = "completed";
    }, 5000);
}
```

This allows the workflow to be tested without introducing external systems such as workers, queues, or media processing
tools.

The focus is on understanding the lifecycle rather than the actual work being performed.

---

### 5. Separation of Concerns

Creating a job and processing a job are separate responsibilities.

The API is responsible for:

* Creating jobs
* Returning job identifiers
* Providing job status

The processor is responsible for:

* Performing work
* Updating job status
* Marking jobs as completed

Although both responsibilities exist in the same file during this experiment, they will eventually become separate
services.

---

## Success Criteria

The experiment is considered successful when:

* A client can create a new job.
* A unique job identifier is generated.
* Jobs are stored in memory.
* Job status can be retrieved through an API endpoint.
* Status transitions from `pending` to `processing`.
* Status transitions from `processing` to `completed`.
* The client can observe status changes over time.
