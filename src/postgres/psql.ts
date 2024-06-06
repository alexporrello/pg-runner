import { exit } from 'process';
import readline from 'node:readline';

import { execute } from './execute.js';

export const launchPsql = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    /**
     * Recursively reads user input when in psql mode.
     * @param rl A node `readline` interface
     */
    const readIn = () => {
        rl.question('psql=# ', (psql) => {
            if (psql === 'exit') exit();
            execute(psql).subscribe({
                next: () => readIn()
            });
        });
    };

    readIn();
};
