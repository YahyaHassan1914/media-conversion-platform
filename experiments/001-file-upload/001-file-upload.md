---
title: File Upload Experiment
experiment: 001
status: completed
difficulty: beginner
---

# 001 - File Upload

## Overview

This experiment explores the fundamental file upload workflow that will be used throughout the Media Conversion
Platform.

The goal is to verify that a user can select a file in the browser, upload it to a backend server, and have the server
successfully store the file on disk.

This is one of the core building blocks of the final platform, since every media conversion process begins with
receiving a file from the user.

---

## Objectives

* Learn how browser-based file uploads work.
* Understand the `multipart/form-data` request format.
* Learn how to send files using `FormData`.
* Receive uploaded files in an Express server.
* Store uploaded files on disk using Multer.
* Understand the upload flow before introducing conversion, queues, or workers.

---

## Architecture

```text
Browser
    │
    │ HTTP POST
    │ multipart/form-data
    │
    ▼
Express API
    │
    │ Multer
    │
    ▼
uploads/
```

---

## Project Structure

```text
001-file-upload/
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
│   └── uploads/
│
└── README.md
```

---

## Workflow

1. User selects a file in the browser.
2. Client creates a `FormData` object.
3. Browser sends a POST request to the server.
4. Express receives the request.
5. Multer extracts the uploaded file.
6. File is saved to the `uploads` directory.
7. Server returns a success response.

---

## Technologies

### Frontend

* HTML
* CSS
* JavaScript
* Fetch API
* FormData API

### Backend

* Node.js
* Express
* Multer

---

## Key Concepts

### 1. File Input

The browser provides a file input element that allows users to select one or more files from their device.

```html
<input type="file">
```

When a file is selected, the browser creates a `File` object that can be accessed through JavaScript.

```js
const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    console.log(file);
});
```

---

### 2. FormData

`FormData` is a browser API used to construct form submissions programmatically, including file uploads.

```js
const formData = new FormData();
formData.append("file", file);
```

It automatically formats the request so that files and other form fields can be transmitted together.

```js
await fetch("/upload", {
    method: "POST",
    body: formData
});
```

---

### 3. multipart/form-data

`multipart/form-data` is the HTTP content type used when sending files to a server.

Unlike JSON requests, file uploads require a multipart format because binary file data cannot be represented efficiently
as standard JSON.

The browser automatically sets this content type when a `FormData` object is sent using `fetch()`.

```http
POST /upload HTTP/1.1
Content-Type: multipart/form-data
```

---

### 4. Multer

Multer is Express middleware designed specifically for handling `multipart/form-data` requests.

Its responsibilities include:

* Parsing incoming file uploads
* Extracting file metadata
* Saving uploaded files to disk
* Making uploaded file information available through `req.file` or `req.files`

Example configuration:

```js
import multer from "multer";

const upload = multer({
    dest: "uploads/"
});
```

Using Multer in a route:

```js
app.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file);

    res.json({
        message: "Upload successful"
    });
});
```

This allows the server to process uploaded files without manually handling the multipart request format.

---

## Success Criteria

The experiment is considered successful when:

* A file can be selected in the browser.
* The file is uploaded successfully.
* The server receives the file.
* The file appears in the `uploads` directory.
* The server returns a successful response.
