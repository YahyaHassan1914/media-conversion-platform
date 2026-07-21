import {run} from "../utils/process.js";

export const convertAudio = (input, output) => {
    return run("ffmpeg", [
        "-i",
        input,
        output
    ]);
};
