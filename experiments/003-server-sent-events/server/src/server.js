import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/events", (req, res) => {
    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    console.log("Client connected");

    let counter = 1;

    const interval = setInterval(() => {
        if (counter <= 10) {
            res.write(`data: Message ${counter}\n\n`);
            counter++;
            return;
        }

        // Notify the client that we're done
        res.write(`event: complete\n`);
        res.write(`data: Counting finished\n\n`);

        clearInterval(interval);

        // Give the client a moment to process the event
        setTimeout(() => {
            console.log("Server closed connection");
            res.end();
        }, 100);
    }, 1000);

    req.on("close", () => {
        console.log("Client disconnected");

        clearInterval(interval);

        // Prevent attempting to end an already closed response
        if (!res.writableEnded) {
            res.end();
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});