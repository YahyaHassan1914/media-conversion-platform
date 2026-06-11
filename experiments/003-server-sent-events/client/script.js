const startBtn = document.getElementById("startBtn");
const messages = document.getElementById("messages");

let eventSource = null;

startBtn.addEventListener("click", () => {
    if (eventSource) {
        return;
    }

    messages.innerHTML = "";

    eventSource = new EventSource("http://localhost:3000/events");

    eventSource.onopen = () => {
        console.log("Connected to SSE server");
    };

    eventSource.onmessage = (event) => {
        const p = document.createElement("p");
        p.textContent = event.data;
        messages.appendChild(p);
    };

    eventSource.addEventListener("complete", (event) => {
        const p = document.createElement("p");
        p.textContent = event.data;
        messages.appendChild(p);

        console.log("SSE stream completed");

        eventSource.close();
        eventSource = null;
    });

    eventSource.onerror = (error) => {
        // Ignore the error if we intentionally closed the connection
        if (
            eventSource &&
            eventSource.readyState === EventSource.CLOSED
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
});