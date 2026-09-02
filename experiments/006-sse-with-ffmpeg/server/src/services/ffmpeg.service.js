import { execFile, spawn } from "child_process";


export function getAudioDuration(inputPath) {
    return new Promise((resolve, reject) => {
        execFile(
            "ffprobe",
            [
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                inputPath
            ],
            (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }

                const duration = parseFloat(stdout);

                if (Number.isNaN(duration)) {
                    reject(
                        new Error("Unable to determine audio duration.")
                    );
                    return;
                }

                resolve(duration);
            }
        );
    });
}

export function convertAudio({
                                 inputPath,
                                 outputPath,
                                 duration,
                                 onProgress,
                                 onComplete,
                                 onError
                             }) {
    const ffmpeg = spawn("ffmpeg", [
        "-i",
        inputPath,
        "-progress",
        "pipe:1",
        "-nostats",
        outputPath
    ]);

    ffmpeg.stdout.on("data", (data) => {
        const output = data.toString();

        const lines = output.split("\n");

        for (const line of lines) {
            if (!line.startsWith("out_time_ms=")) {
                continue;
            }

            const outTimeMs = Number(
                line.split("=")[1]
            );

            const currentTime = outTimeMs / 1_000_000;

            const progress = Math.min(
                100,
                Math.round(
                    (currentTime / duration) * 100
                )
            );

            onProgress(progress);
        }
    });

    ffmpeg.stderr.on("data", (data) => {
        // FFmpeg writes diagnostic information here.
        // We can add proper logging later.
    });

    ffmpeg.on("close", (code) => {
        if (code === 0) {
            onComplete();
        } else {
            onError(
                new Error(
                    `FFmpeg exited with code ${code}`
                )
            );
        }
    });
}