---
title: Server Sent Events Experiment
experiment: 003
status: completed
difficulty: beginner
---

# 003 - Server Sent Events

## Overview

This experiment explores Server-Sent Events (SSE), a browser technology that allows a server to push real-time updates
to connected clients over a single HTTP connection.

The goal is to verify that a client can establish a persistent connection with a server and receive a continuous stream
of messages without repeatedly sending requests.

This experiment introduces real-time communication concepts that will later be used for job progress tracking and status
notifications within the Media Conversion Platform.

---

## Objectives

* Learn how Server-Sent Events work.
* Establish a persistent connection between a browser and a server.
* Stream data from the server to the client in real time.
* Handle standard and custom SSE events.
* Understand connection lifecycle management.
* Learn how clients receive updates without polling.
* Explore the foundation for real-time job status updates.

---

## Architecture

```text
Browser
    │
    │ GET /events
    │
    ▼
Express API
    │
    │ Open SSE Connection
    │
    ▼
Message Stream
    │
    │ data: Message 1
    │ data: Message 2
    │ data: Message 3
    │ ...
    │
    ▼
Browser Receives Updates
    │
    │ event: complete
    │
    ▼
Connection Closed
```

---

## Project Structure

```text
003-server-sent-events/
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

1. User clicks the "Start Listening" button.
2. Client creates an `EventSource` connection.
3. Browser sends a request to `/events`.
4. Server accepts the connection and configures SSE headers.
5. Server begins streaming messages every second.
6. Client receives each message immediately.
7. Messages are displayed in the browser.
8. After ten messages, the server emits a custom `complete` event.
9. Client handles the completion event.
10. Client closes the connection.
11. Server detects the disconnection and cleans up resources.

---

## Technologies

### Frontend

* HTML
* CSS
* JavaScript
* EventSource API

### Backend

* Node.js
* Express
* CORS

---

## Key Concepts

### 1. Server-Sent Events (SSE)

Server-Sent Events allow a server to continuously send updates to a client over a single HTTP connection.

Unlike traditional request-response communication, the connection remains open and the server pushes data whenever new
information becomes available.

Client example:

```js
const eventSource = new EventSource(
    "http://localhost:3000/events"
);
```

Once connected, the browser automatically listens for incoming events.

---

### 2. Persistent Connections

An SSE connection stays open until either the client or the server closes it.

```text
Client
    │
    ├── GET /events
    │
    ▼
Server
    │
    ├── Message 1
    ├── Message 2
    ├── Message 3
    └── ...
```

This differs from standard HTTP requests where the connection is closed after a response is returned.

Persistent connections are useful for:

* Job progress updates
* Notifications
* Monitoring dashboards
* Live status tracking

---

### 3. SSE Message Format

SSE messages follow a simple text-based format.

Example:

```text
data: Message 1

data: Message 2
```

Server implementation:

```js
res.write(`data: Message ${counter}\n\n`);
```

Each message is separated by a blank line, which signals the end of the event.

---

### 4. Custom Events

SSE supports named events in addition to standard messages.

Server:

```js
res.write(`event: complete\n`);
res.write(`data: Counting finished\n\n`);
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

Custom events allow different types of updates to be handled independently.

Examples:

```text
progress
complete
error
notification
```

This becomes useful when tracking complex workflows.

---

### 5. EventSource API

Browsers provide the `EventSource` interface for working with SSE.

```js
const eventSource = new EventSource(
    "/events"
);
```

Common event handlers:

```js
eventSource.onopen
eventSource.onmessage
eventSource.onerror
```

These handlers allow applications to respond to connection events and incoming messages.

---

### 6. Connection Lifecycle

The SSE connection follows a predictable lifecycle.

```text
Disconnected
      │
      ▼
Connecting
      │
      ▼
Connected
      │
      ▼
Receiving Messages
      │
      ▼
Completed
      │
      ▼
Disconnected
```

Properly handling connection creation and cleanup prevents resource leaks on both the client and server.

---

### 7. Resource Cleanup

When a client disconnects, the server should stop any ongoing work associated with that connection.

Server example:

```js
req.on("close", () => {
    clearInterval(interval);

    if (!res.writableEnded) {
        res.end();
    }
});
```

This ensures that timers and other resources are released immediately when the connection is no longer needed.

---

### 8. SSE vs Polling

In the previous experiment, the client repeatedly requested status updates using polling.

Polling:

```text
Client
    │
    ├── Request
    ├── Request
    ├── Request
    └── Request
```

SSE:

```text
Client
    │
    └── Single Connection
             │
             ▼
        Continuous Updates
```

Advantages of SSE:

* Fewer HTTP requests
* Lower network overhead
* Simpler client implementation
* Near real-time updates

Polling may still be useful when:

* SSE is unavailable
* Updates are infrequent
* Bidirectional communication is not required

---

## Success Criteria

The experiment is considered successful when:

* A client can establish an SSE connection.
* The server maintains a persistent HTTP connection.
* Messages are streamed from the server to the client.
* Messages appear in the browser in real time.
* Custom SSE events can be sent and received.
* The client can detect stream completion.
* Connections can be closed gracefully.
* Server resources are cleaned up when a client disconnects.
* The difference between polling and SSE is understood.
