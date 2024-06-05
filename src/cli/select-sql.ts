import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { map } from 'rxjs';
import { exit } from 'process';

import { prompt } from '../util/prompt.js';
import { logErr } from '../util/log.js';

const dirPath = resolve();
const settingsPath = join(dirPath, '.pg-runner.tmp');

/**
 * Prompts the user to select an SQL file
 * @returns The path to an SQL file
 */
export function selectSQL() {
    let recent = existsSync(settingsPath)
        ? JSON.parse(readFileSync(settingsPath, 'utf-8')).recent
        : null;

    const sqlFiles = readdirSync(dirPath).filter((dir: string) =>
        dir.endsWith('.sql')
    );

    if (sqlFiles.length === 0) {
        logErr(
            'Error: This command must be run in a folder that contains .sql files.'
        );
        exit(0);
    }

    const select_file = 'select_file';
    const cursor_res = 'cursor_res';

    return prompt<{
        [select_file]: string;
        [cursor_res]: 'Y' | 'N' | 'y' | 'n';
    }>([
        {
            name: select_file,
            type: 'list',
            choices: recent ? [recent, ...sqlFiles] : sqlFiles,
            message: 'Select an SQL file to execute'
        },
        {
            name: cursor_res,
            type: '',
            choices: ['Y', 'N'],
            message: 'Does this function return a cursor? [Y/n]'
        }
    ]).pipe(
        map((answer) => ({
            [select_file]: answer[select_file],
            [cursor_res]:
                answer[cursor_res] === 'Y' || answer[cursor_res] === 'y'
        }))
    );
}
