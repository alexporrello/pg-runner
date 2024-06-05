import pg from 'pg';
import { Observable } from 'rxjs';

import { logErr, logInfo } from '../util/log.js';

export function clientEnd(client: pg.Client) {
    return new Observable<void>((subscriber) => {
        client
            .end()
            .then(() => {
                logInfo('Connection closed');
                subscriber.complete();
            })
            .catch((err) => {
                logErr('Error: Failed to close connection.');
                subscriber.error(err);
            });
    });
}
