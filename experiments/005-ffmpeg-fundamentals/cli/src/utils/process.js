import {spawn} from "node:child_process";

export function run(command, args) {
    return new Promise((resolve, reject) => {

        const child = spawn(command, args);

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", data => {
            stdout += data;
        });

        child.stderr.on("data", data => {
            stderr += data;
        });

        child.on("error", reject);

        child.on("close", code => {

            if (code === 0) {
                resolve({stdout, stderr});

                return;
            }

            reject(new Error(`${command} exited with code ${code}\n${stderr}`));
        });
    });
}
