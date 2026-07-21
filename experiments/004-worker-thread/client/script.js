const startBtn = document.getElementById("startBtn");
const messages = document.getElementById("messages");

let eventSource = null;

startBtn.addEventListener("click", async () => {
    if (eventSource) {
        return;
    }

    messages.innerHTML = "";

    try {
        // Start the job
        const response = await fetch(
            "http://localhost:3000/jobs",
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create job");
        }

        const job = await response.json();

        console.log("Job created:", job);

        // Subscribe to job updates
        eventSource = new EventSource(
            `http://localhost:3000/jobs/${job.id}/events`
        );

        eventSource.onopen = () => {
            console.log("Connected to SSE server");
        };

        eventSource.onmessage = (event) => {
            const p = document.createElement("p");

            p.textContent = event.data;

            messages.appendChild(p);
        };

        eventSource.addEventListener(
            "complete",
            (event) => {
                const p = document.createElement("p");

                p.textContent = event.data;

                messages.appendChild(p);

                console.log("SSE stream completed");

                eventSource.close();
                eventSource = null;
            }
        );

        eventSource.onerror = (error) => {
            if (
                eventSource &&
                eventSource.readyState ===
                EventSource.CLOSED
            ) {
                console.log("Connection closed");
            } else {
                console.error("SSE Error:", error);
            }

            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
        };
    } catch (error) {
        console.error("Failed to start job:", error);

        const p = document.createElement("p");

        p.textContent = "Failed to start job.";

        messages.appendChild(p);
    }
});