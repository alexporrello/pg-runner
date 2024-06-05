import pg from 'pg';
import { exit } from 'process';
import { Observable } from 'rxjs';

import { logErr, logInfo } from '../util/log.js';

export function clientConnect(params: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}) {
    const client = new pg.Client(params);

    return new Observable<pg.Client>((subscriber) => {
        client
            .connect()
            .then(() => {
                logInfo('Client connected.');
                subscriber.next(client);
            })
            .catch((err) => {
                logErr(
                    'Error: Failed to establish connection.\n       ' +
                        params.user +
                        ':' +
                        params.database +
                        '@' +
                        params.host
                );
                logErr(err);
                exit(5);
            });
    });
}
