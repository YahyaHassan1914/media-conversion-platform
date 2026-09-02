// =========================
// DOM Elements
// =========================

const audioFileInput = document.getElementById("audioFile");
const fileName = document.getElementById("fileName");

const outputFormat = document.getElementById("outputFormat");
const convertButton = document.getElementById("convertButton");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const statusText = document.getElementById("statusText");
const downloadLink = document.getElementById("downloadLink");


// =========================
// Configuration
// =========================

const SERVER_URL = "http://localhost:3000";


// =========================
// Utility Functions
// =========================

function formatFileSize(bytes) {
    const megabytes = bytes / (1024 * 1024);

    return `${megabytes.toFixed(2)} MB`;
}


function resetProgress() {
    progressBar.value = 0;
    progressText.textContent = "0%";
}


function resetResult() {
    statusText.textContent = "No conversion yet.";

    downloadLink.hidden = true;
    downloadLink.href = "#";
}


function setConvertingState() {
    convertButton.disabled = true;

    statusText.textContent = "Converting...";

    resetProgress();
    resetResult();

    statusText.textContent = "Converting...";
}


function setCompletedState(jobId) {
    convertButton.disabled = false;

    progressBar.value = 100;
    progressText.textContent = "100%";

    statusText.textContent = "Conversion completed!";

    downloadLink.href =
        `${SERVER_URL}/download/${jobId}`;

    downloadLink.hidden = false;
}


function setErrorState(message) {
    convertButton.disabled = false;

    statusText.textContent = message;
}


// =========================
// File Selection
// =========================

audioFileInput.addEventListener("change", () => {
    const file = audioFileInput.files[0];

    if (!file) {
        fileName.textContent = "No file selected";
        return;
    }

    fileName.textContent =
        `${file.name} (${formatFileSize(file.size)})`;

    resetProgress();
    resetResult();
});


// =========================
// Conversion
// =========================

convertButton.addEventListener("click", async () => {
    const file = audioFileInput.files[0];
    const format = outputFormat.value;

    if (!file) {
        alert("Please select an audio file.");
        return;
    }

    setConvertingState();

    const formData = new FormData();

    formData.append("audio", file);
    formData.append("format", format);

    try {
        const response = await fetch(
            `${SERVER_URL}/convert`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Failed to start conversion.");
        }

        const result = await response.json();

        console.log("Job ID:", result.jobId);

        monitorProgress(result.jobId);

    } catch (error) {
        console.error("Upload failed:", error);

        setErrorState(
            "Failed to start conversion."
        );
    }
});


// =========================
// SSE Progress
// =========================

function monitorProgress(jobId) {
    const eventSource = new EventSource(
        `${SERVER_URL}/progress/${jobId}`
    );


    // Progress event
    eventSource.addEventListener(
        "progress",
        (event) => {
            const data = JSON.parse(event.data);

            progressBar.value = data.progress;
            progressText.textContent =
                `${data.progress}%`;
        }
    );


    // Completed event
    eventSource.addEventListener(
        "completed",
        (event) => {
            const data = JSON.parse(event.data);

            console.log(
                "Conversion completed:",
                data.jobId
            );

            setCompletedState(data.jobId);

            eventSource.close();
        }
    );


    // Error event
    eventSource.addEventListener(
        "error",
        (event) => {
            console.error(
                "Conversion error:",
                event
            );

            eventSource.close();

            setErrorState(
                "Conversion failed."
            );
        }
    );
}