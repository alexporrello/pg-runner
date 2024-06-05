import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Observable, concatMap, map } from 'rxjs';

import { clientConnect } from '../pg/client-connect.js';
import { clientEnd } from '../pg/client-end.js';
import { logInfo } from '../util/log.js';
import { prompt } from '../util/prompt.js';
import { readFileRx } from '../util/fs.js';
import { __dirname } from '../dirname.js';

const settingsPath = join(__dirname, 'settings.json');

const input_host = 'host';
const input_port = 'port';
const input_user = 'user';
const input_password = 'password';
const input_database = 'database';

export declare interface InitializeParams {
    [input_host]: string;
    [input_port]: number;
    [input_user]: string;
    [input_database]: string;
    [input_password]: string;
}

/**
 * Prompts user to initialize a Postgresql database. If a new database
 * connection is being created, tests the connection and writes
 * the parameters to {@link __dirname}.
 * @returns An observable of the Postgresql connection parameters
 */
export function initialize(): Observable<InitializeParams> {
    if (!existsSync(settingsPath))
        return prompt<InitializeParams>([
            {
                name: input_host,
                type: 'string',
                message: 'What is the IP of your PostgreSQL database?',
                default: 'localhost'
            },
            {
                name: input_port,
                type: 'number',
                message: 'What is the port of your PostgreSQL database?',
                default: 5432
            },
            {
                name: input_database,
                type: 'string',
                message: 'What database will you be querying against?',
                default: 'postgres'
            },
            {
                name: input_user,
                type: 'string',
                message: 'Enter the username that will execute your queries.',
                default: 'postgres'
            },
            {
                name: input_password,
                type: 'password',
                message: 'Please enter the database password.'
            }
        ]).pipe(
            concatMap((params) =>
                clientConnect(params).pipe(
                    concatMap((client) => {
                        logInfo('Connection established.');
                        writeFileSync(
                            settingsPath,
                            JSON.stringify(params),
                            'utf-8'
                        );
                        return clientEnd(client).pipe(map(() => params));
                    })
                )
            )
        );

    return readFileRx<InitializeParams>(settingsPath, {
        parse: true
    });
}
