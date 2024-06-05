import { concatMap, map, of } from 'rxjs';
import { existsSync } from 'fs';
import { exit } from 'process';
import readline = require('node:readline');

import { args, findArg, includesArg } from '../util/parse-args.js';
import { formatQuery } from '../cli/format-query.js';
import { initialize } from '../cli/initialize.js';
import { logErr, logSuccess } from '../util/log.js';
import { printHelp } from '../cli.js';
import { RxClient } from '../pg/rx-client.js';

/** Determines if an argument is a valid path-like. */
const isPathLike = (path: string) =>
    path.startsWith('./') || path.includes('/');

export const launchSQLRunner = () => {
    /** A script to execute passed into the cli as a parameter. */
    let script: string | undefined;

    /** A path to a sql file passed into the cli as a parameter. */
    let path: string | undefined;

    let psql = includesArg('psql');

    /** If the script or path returns cursors. */
    let cursors = findArg('-c', '--cursors', 'boolean') ?? false;

    /** Define the console print type. */
    let output = (findArg('-o', '--output') ?? 'table') as 'table' | 'json';

    const readIn = (rl: readline.Interface) => {
        rl.question('psql=# ', (psql) => {
            if (psql === 'exit') exit();

            if (isPathLike(psql)) {
            }

            execute(psql).subscribe({
                next: () => readIn(rl)
            });
        });
    };

    const execute = (pathOrScript?: string) => {
        if (pathOrScript) {
            if (isPathLike(pathOrScript)) {
                if (existsSync(pathOrScript)) path = pathOrScript;
                else {
                    logErr(
                        'Error: You must point to a valid system path. Both absolute and relative paths are acceptable.'
                    );
                    exit(5);
                }
            } else {
                script = pathOrScript;
            }
        } else {
            logErr('Error: You must specify a path or script to execute.');
            printHelp();
            return of('');
        }

        return initialize().pipe(
            concatMap((params) =>
                formatQuery(script, path, cursors).pipe(
                    concatMap((query) => {
                        const client = new RxClient(params);
                        return client.execute(query, cursors);
                    })
                )
            ),
            map((res) => {
                res.forEach((queryResult) => {
                    logSuccess(
                        `${queryResult.command} returned ${queryResult.rowCount} rows.`
                    );

                    switch (output) {
                        case 'json':
                            console.log(JSON.stringify(queryResult.rows));
                            break;
                        default:
                            console.table(
                                queryResult.rows,
                                queryResult.fields.map((field) => field.name)
                            );
                    }
                });

                return 'Query complete.';
            })
        );
    };

    if (psql) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readIn(rl);
    } else {
        const pathOrScript = args[0];
        execute(pathOrScript).subscribe();
    }
};
