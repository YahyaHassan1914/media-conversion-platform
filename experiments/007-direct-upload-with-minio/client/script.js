const fileInput = document.getElementById("fileInput");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileType = document.getElementById("fileType");

const uploadButton = document.getElementById("uploadButton");

const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressPercentage = document.getElementById("progressPercentage");
const progressDetails = document.getElementById("progressDetails");
const status = document.getElementById("status");

let selectedFile = null;

fileInput.addEventListener("change", () => {

    selectedFile = fileInput.files[0];

    if (!selectedFile) {
        uploadButton.disabled = true;
        fileInfo.classList.add("hidden");
        return;
    }

    fileName.textContent = selectedFile.name;
    fileSize.textContent = formatFileSize(selectedFile.size);
    fileType.textContent = selectedFile.type || "Unknown";

    fileInfo.classList.remove("hidden");

    uploadButton.disabled = false;

    status.textContent = "";
});

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    const i =
        Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

    return (
        bytes / Math.pow(1024, i)
    ).toFixed(2) + " " + units[i];
}

uploadButton.addEventListener("click", async () => {

    if (!selectedFile) {
        return;
    }

    try {

        uploadButton.disabled = true;

        status.textContent =
            "Preparing upload...";

        progressContainer.classList.remove("hidden");

        resetProgress();

        const uploadInfo =
            await initializeUpload(selectedFile);

        console.log("Upload information:", uploadInfo);

        await uploadFile(
            selectedFile,
            uploadInfo.uploadUrl
        );

        status.textContent =
            "Upload completed successfully.";

        progressDetails.textContent =
            "File uploaded to MinIO.";

    } catch (error) {

        console.error(error);

        status.textContent =
            `Upload failed: ${error.message}`;

    } finally {

        uploadButton.disabled = false;
    }
});

async function initializeUpload(file) {

    const response =
        await fetch(
            "http://localhost:3000/api/uploads",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    size: file.size
                })
            }
        );

    if (!response.ok) {

        const error =
            await response.json();

        throw new Error(
            error.message ||
            "Failed to initialize upload"
        );
    }

    return response.json();
}

function uploadFile(file, uploadUrl) {

    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open("PUT", uploadUrl);

        xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream"
        );

        xhr.upload.addEventListener(
            "progress",
            (event) => {

                if (!event.lengthComputable) {
                    return;
                }

                const percentage =
                    (event.loaded / event.total) * 100;

                updateProgress(
                    percentage,
                    event.loaded,
                    event.total
                );
            }
        );

        xhr.addEventListener(
            "load",
            () => {

                if (
                    xhr.status >= 200 &&
                    xhr.status < 300
                ) {

                    resolve();

                } else {

                    reject(
                        new Error(
                            `MinIO upload failed with status ${xhr.status}`
                        )
                    );
                }
            }
        );

        xhr.addEventListener(
            "error",
            () => {

                reject(
                    new Error(
                        "Network error during upload"
                    )
                );
            }
        );

        xhr.addEventListener(
            "abort",
            () => {

                reject(
                    new Error(
                        "Upload was aborted"
                    )
                );
            }
        );

        xhr.send(file);
    });
}

function updateProgress(
    percentage,
    loaded,
    total
) {

    const roundedPercentage =
        Math.round(percentage);

    progressBar.style.width =
        `${percentage}%`;

    progressPercentage.textContent =
        `${roundedPercentage}%`;

    progressDetails.textContent =
        `${formatFileSize(loaded)} / ${formatFileSize(total)}`;
}

function resetProgress() {

    progressBar.style.width = "0%";

    progressPercentage.textContent = "0%";

    progressDetails.textContent =
        "Preparing upload...";
}