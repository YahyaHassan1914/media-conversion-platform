const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const message = document.getElementById("message");

uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
        message.textContent = "Select a file first.";
        return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
        const response = await fetch(
            "http://localhost:3000/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        message.textContent = data.message;
    } catch {
        message.textContent = "Upload failed.";
    }
});