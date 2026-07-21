import {getMetadata} from "./commands/metadata.js";
import {convertAudio} from "./commands/convert.js";
import {printHelp} from "./commands/help.js";

import {Command} from "./constants/commands.js";

const COMMANDS = {
    [Command.HELP]: {
        usage: "media help",
        args: 0,
        handler: async () => {
            printHelp();
        }
    },

    [Command.METADATA]: {
        usage: "media metadata <file>",
        args: 1,
        handler: async ([input]) => {
            const metadata = await getMetadata(input);

            console.log(metadata);
        }
    },

    [Command.CONVERT]: {
        usage: "media convert <input> <output>",
        args: 2,
        handler: async ([input, output]) => {
            await convertAudio(input, output);

            console.log("Conversion completed.");
        }
    }
};

const [commandName, ...commandArgs] = process.argv.slice(2);

const command = COMMANDS[commandName];

try {
    if (!command) {
        printHelp();
        process.exit(1);
    }

    if (commandArgs.length < command.args) {
        console.error(`Usage: ${command.usage}`);
        process.exit(1);
    }

    await command.handler(commandArgs);
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
