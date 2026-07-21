import {run} from "../utils/process.js";

export const getMetadata = async (input) => {
    const {stdout} = await run("ffprobe", [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        input
    ]);

    return JSON.parse(stdout);
};
