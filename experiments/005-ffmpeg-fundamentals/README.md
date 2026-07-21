---
title: FFmpeg CLI Media Processing Experiment
experiment: 005
status: completed
difficulty: beginner
---

# 005 - FFmpeg CLI Media Processing

## Overview

This experiment demonstrates how to build a simple command-line application for media processing using FFmpeg and FFprobe.

The application supports extracting media metadata and converting audio files by spawning external processes from Node.js.

The goal is to understand how Node.js applications can integrate with native command-line tools while providing a clean command-based interface.

This experiment introduces the foundation for the Media Conversion Platform, where FFmpeg will later be used to perform media analysis, transcoding, and other processing tasks.

---

## Objectives

* Learn how to build a command-line application in Node.js.
* Execute external programs using `child_process.spawn()`.
* Integrate FFmpeg into a Node.js application.
* Extract media metadata using FFprobe.
* Convert audio files with FFmpeg.
* Handle asynchronous process execution with Promises.
* Capture process output and errors.
* Validate command-line arguments.
* Organize CLI commands into modular handlers.

---

## Architecture

```text
User
    │
    │ media <command>
    │
    ▼
CLI Entry Point
    │
    │ Parse Arguments
    │
    ▼
Command Router
    │
    ├───────────────┐
    │               │
    ▼               ▼
Metadata       Audio Conversion
    │               │
    ▼               ▼
FFprobe        FFmpeg
    │               │
    ▼               ▼
Process Output
    │
    ▼
Console
```

---

## Project Structure

```text
005-ffmpeg-fundamentals/
│
├── cli/
│   ├── src/
│   │   ├── commands/
│   │   │   ├── convert.js
│   │   │   ├── help.js
│   │   │   └── metadata.js
│   │   │
│   │   ├── constants/
│   │   │   └── commands.js
│   │   │
│   │   ├── utils/
│   │   │   └── process.js
│   │   │
│   │   └── index.js
│   │
│   └── package.json 
│
├── .gitignore
└── README.md
```

---

## Workflow

1. User executes a CLI command.
2. Arguments are parsed from the command line.
3. The requested command is validated.
4. Required arguments are checked.
5. The appropriate command handler is executed.
6. The handler launches FFmpeg or FFprobe.
7. Node.js waits for the external process to finish.
8. Standard output is captured.
9. Results are displayed to the user.
10. Errors are reported if execution fails.

---

## Technologies

### Runtime

* Node.js

### Media Tools

* FFmpeg
* FFprobe

### Node APIs

* child_process.spawn()

---

## Key Concepts

### 1. Command-Line Interface (CLI)

The application is driven entirely through command-line arguments.

Example:

```bash
media metadata song.mp3

media convert song.mp3 song.wav
```

The entry point parses the command and dispatches it to the appropriate handler.

```js
const [commandName, ...commandArgs] = process.argv.slice(2);
```

---

### 2. Command Routing

Each supported command is registered in a command table.

```js
const COMMANDS = {
    metadata: { ... },
    convert: { ... },
    help: { ... }
};
```

This approach makes it easy to add new commands without modifying the application flow.

---

### 3. Modular Command Handlers

Each command lives in its own module.

```text
commands/
    metadata.js
    convert.js
    help.js
```

Separating responsibilities improves maintainability and scalability as the CLI grows.

---

### 4. Running External Processes

Instead of implementing media processing directly, the application delegates the work to FFmpeg and FFprobe.

```js
spawn(command, args);
```

Node.js launches the external executable and communicates with it through standard input and output streams.

---

### 5. Promise-Based Process Execution

The process utility wraps `spawn()` inside a Promise.

```js
run("ffmpeg", args);
```

This allows commands to use modern asynchronous syntax.

```js
await convertAudio(input, output);
```

The result is simpler, more readable code.

---

### 6. Reading Media Metadata

Media information is extracted using FFprobe.

```bash
ffprobe
```

The command requests structured JSON output.

```js
-show_format
-show_streams
```

The JSON response is parsed into a JavaScript object.

```js
JSON.parse(stdout);
```

Metadata can include:

* Duration
* Codec
* Bitrate
* Sample rate
* Channels
* Container format

---

### 7. Audio Conversion

Audio conversion is performed by FFmpeg.

Example:

```bash
media convert song.mp3 song.wav
```

Internally the application executes:

```bash
ffmpeg -i song.mp3 song.wav
```

FFmpeg automatically selects the appropriate conversion pipeline based on the input and output formats.

---

### 8. Capturing Process Output

The utility collects both standard output and standard error.

```js
child.stdout.on("data", ...);

child.stderr.on("data", ...);
```

This information is returned to the caller after the process exits.

---

### 9. Error Handling

If FFmpeg exits with a non-zero status code, the Promise is rejected.

```js
reject(
    new Error(...)
);
```

This allows the CLI to report meaningful errors while terminating with the correct exit code.

---

### 10. Input Validation

Before executing a command, the CLI validates the provided arguments.

```js
if (commandArgs.length < command.args)
```

If required arguments are missing, the application displays the expected usage.

```text
Usage:

media convert <input> <output>
```

This prevents invalid process execution.

---

### 11. Help Command

A dedicated help command documents the available functionality.

```bash
media help
```

It provides:

* Available commands
* Required arguments
* Usage examples

This improves discoverability for users of the CLI.

---

### 12. Foundation for the Media Conversion Platform

This experiment introduces several concepts that will be reused later:

* FFmpeg integration
* FFprobe metadata extraction
* Command-based application architecture
* External process management
* Asynchronous execution
* Modular command organization
* Error handling
* Media processing workflows

These concepts provide the foundation for building a production-ready media conversion service.

---

## Success Criteria

The experiment is considered successful when:

* The CLI parses commands correctly.
* Invalid commands display usage information.
* Missing arguments are detected.
* FFprobe successfully extracts media metadata.
* Metadata is returned as structured JSON.
* FFmpeg successfully converts audio files.
* External processes execute asynchronously.
* Process output is captured correctly.
* Errors are reported gracefully.
* The command architecture is modular and extensible.
* The experiment demonstrates successful integration between Node.js and FFmpeg.