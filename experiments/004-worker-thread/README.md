---
title: Worker Threads with SSE Job Progress Experiment
experiment: 004
status: completed
difficulty: beginner
---

# 004 - Worker Threads with Server-Sent Events

## Overview

This experiment combines Node.js Worker Threads with Server-Sent Events (SSE) to simulate background job processing and
real-time progress tracking.

The goal is to verify that long-running work can be executed outside the main application thread while clients receive
live progress updates through a persistent SSE connection.

This experiment introduces the foundation for asynchronous job execution, progress monitoring, and event-driven
communication that will later be used in the Media Conversion Platform for tasks such as file conversion and processing
workflows.

---

## Objectives

* Learn how Worker Threads operate in Node.js.
* Execute long-running work outside the main thread.
* Create and manage background jobs.
* Track job state and progress.
* Stream progress updates to clients using SSE.
* Understand communication between the main thread and worker threads.
* Learn how to manage multiple SSE subscribers.
* Explore the foundation for real-time job processing systems.

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
Job Registry
    │
    │ Send Job
    │
    ▼
Worker Thread
    │
    │ Progress Updates
    │
    ▼
Main Thread
    │
    │ SSE Messages
    │
    ▼
Connected Clients
    │
    │ Progress Events
    │
    ▼
Job Completed
```

---

## Project Structure

```text
004-worker-thread-sse/
│
├── client/
│   ├── index.html
│   └── script.js
│
├── server/
│   ├── src/
│   │   ├── server.js
│   │   ├── worker.js
│   │   ├── jobs.js
│   │   └── clients.js
│   │
│   └── package.json
│
└── README.md
```

---

## Workflow

1. User clicks the "Start" button.
2. Client sends a request to create a new job.
3. Server generates a unique job ID.
4. Job metadata is stored in memory.
5. Main thread sends the job to a Worker Thread.
6. Client subscribes to the job's SSE endpoint.
7. Worker Thread begins processing.
8. Worker periodically reports progress.
9. Main thread updates the job state.
10. Progress updates are streamed to connected clients.
11. Client receives updates in real time.
12. Worker reports job completion.
13. Server sends a custom `complete` event.
14. SSE connection closes.
15. Job resources and client subscriptions are cleaned up.

---

## Technologies

### Frontend

* HTML
* JavaScript
* Fetch API
* EventSource API

### Backend

* Node.js
* Express
* CORS
* Worker Threads

---

## Key Concepts

### 1. Worker Threads

Worker Threads allow CPU-intensive or long-running tasks to execute separately from the main Node.js event loop.

Instead of blocking incoming requests, work is delegated to a worker.

Main thread:

```js
worker.postMessage({
    type: "start",
    job,
});
```

Worker thread:

```js
parentPort.on("message", (message) => {
    // process job
});
```

This separation keeps the API responsive while work is being performed.

---

### 2. Background Job Processing

Jobs represent units of work that can be executed asynchronously.

Example job:

```js
const job = {
    id,
    progress: 0,
    status: "queued",
};
```

As processing continues, the job state changes:

```text
queued
    ↓
processing
    ↓
completed
```

This pattern is commonly used in:

* Media processing
* File uploads
* Report generation
* Data imports
* Video transcoding

---

### 3. Thread Communication

The main thread and worker thread communicate through messages.

Sending work:

```js
worker.postMessage({
    type: "start",
    job,
});
```

Reporting progress:

```js
parentPort.postMessage({
    type: "progress",
    jobId,
    progress,
});
```

Reporting completion:

```js
parentPort.postMessage({
    type: "complete",
    jobId,
});
```

Messages provide a simple mechanism for exchanging data between threads without sharing execution state.

---

### 4. Job Registry

The server maintains an in-memory collection of jobs.

```js
export const jobs = new Map();
```

Example:

```text
Job ID
    │
    ▼
{
    id,
    progress,
    status
}
```

The registry allows the application to:

* Track job state
* Update progress
* Retrieve job information
* Notify subscribers

---

### 5. Server-Sent Events for Progress Updates

Each job exposes a dedicated SSE stream.

```text
GET /jobs/:id/events
```

The server keeps the connection open and pushes updates whenever progress changes.

Server:

```js
client.write(
    `data: ${JSON.stringify(job)}\n\n`
);
```

Client:

```js
eventSource.onmessage = (event) => {
    console.log(event.data);
};
```

This allows users to observe job execution in real time.

---

### 6. Client Subscription Management

Multiple clients may subscribe to the same job.

The server stores active SSE connections:

```js
export const clients = new Map();
```

Structure:

```text
Job ID
    │
    ▼
Set<Response>
```

This enables the server to broadcast updates to all listeners of a specific job.

---

### 7. Custom Completion Events

When processing finishes, the server sends a custom SSE event.

Server:

```js
client.write(`event: complete\n`);
client.write(`data: done\n\n`);
```

Client:

```js
eventSource.addEventListener(
    "complete",
    (event) => {
        console.log(event.data);
    }
);
```

Custom events provide a clean way to distinguish completion messages from standard progress updates.

---

### 8. Real-Time Progress Streaming

Progress updates are generated by the worker every second.

Worker:

```js
progress += 10;
```

Main thread:

```js
notifyClients(job);
```

Result:

```text
0%
10%
20%
30%
...
100%
```

Clients receive updates immediately without polling.

---

### 9. Connection Lifecycle

The SSE connection follows a predictable lifecycle.

```text
Disconnected
      │
      ▼
Connecting
      │
      ▼
Subscribed
      │
      ▼
Receiving Updates
      │
      ▼
Completed
      │
      ▼
Disconnected
```

Managing the lifecycle correctly ensures resources are released when no longer needed.

---

### 10. Resource Cleanup

When a client disconnects, its SSE connection should be removed.

```js
req.on("close", () => {
    clients.get(id)?.delete(res);
});
```

When a job is completed:

```js
clients.delete(job.id);
```

Proper cleanup prevents memory leaks and stale connections.

---

### 11. Separation of Responsibilities

The system is divided into distinct responsibilities.

```text
Client
    │
    ├── Display Progress
    │
    ▼
Express Server
    │
    ├── Job Management
    ├── SSE Management
    │
    ▼
Worker Thread
    │
    └── Job Execution
```

This architecture improves maintainability and scalability.

---

### 12. Foundation for the Media Conversion Platform

This experiment introduces several patterns that will be reused later:

* Asynchronous job execution
* Background processing
* Real-time progress updates
* Event-driven communication
* Job tracking
* Worker isolation
* Resource cleanup

These concepts form the core of a production-ready media conversion workflow.

---

## Success Criteria

The experiment is considered successful when:

* A client can create a new job.
* Jobs are processed in a Worker Thread.
* The main thread remains responsive.
* Worker Threads can send progress updates.
* Job state is stored and updated correctly.
* Clients can subscribe to job-specific SSE streams.
* Progress updates are streamed in real time.
* Custom completion events are sent and received.
* SSE connections close gracefully.
* Client subscriptions are cleaned up after completion.
* The relationship between Worker Threads and SSE is understood.
* The architecture can serve as a foundation for future job processing workflows.
