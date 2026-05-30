import express from "express";

const app = express();

// middleware
app.use(express.json());

// routes
app.get("/", (req, res) => res.send("Hello World!"));

export default app;
