import pg from 'pg';
import { Observable, catchError, concatMap, map, of } from 'rxjs';

import { formatPgError, isPgError } from './pg.js';

export class RxClient {
    /** A client, initialized in the constructor with {@link params}. */
    private _client: pg.Client;

    constructor(
        public params: {
            host: string;
            port: number;
            user: string;
            password: string;
            database: string;
        }
    ) {
        this._client = new pg.Client(params);
    }

    /**
     * Establishes a connection with the database
     * if a connection has not already been established.
     */
    connect() {
        return new Observable<string>((subscriber) => {
            this._client
                .connect()
                .then(() => {
                    subscriber.next('Client connected');
                    subscriber.complete();
                })
                .catch((err) => {
                    subscriber.error(err);
                });
        });
    }

    query<T extends pg.QueryResultRow>(queryText: string) {
        return new Observable<pg.QueryResult<T>[]>((subscriber) => {
            this._client
                .query({ text: queryText })
                .then((response: pg.QueryResult<T>) => {
                    subscriber.next(
                        Array.isArray(response) ? response : [response]
                    );
                    subscriber.complete();
                })
                .catch((err) => {
                    if (isPgError(err)) {
                        formatPgError(err);
                    }
                    subscriber.next([]);
                    subscriber.complete();
                });
        });
    }

    end() {
        return new Observable<string>((subscriber) => {
            this._client
                .end()
                .then(() => {
                    subscriber.next('Connection closed');
                    subscriber.complete();
                })
                .catch((reason) => {
                    subscriber.error(reason);
                });
        });
    }

    execute<T extends pg.QueryResultRow>(
        queryText: string,
        // @ts-ignore
        returnsCursors?: boolean
    ) {
        return this.connect().pipe(
            concatMap(() =>
                this.query<T>(queryText).pipe(
                    concatMap((queryResult) =>
                        this.end().pipe(
                            catchError((err) => {
                                console.error('Failed to close connection');
                                console.error(err);
                                return of(queryResult);
                            }),
                            map(() => queryResult)
                        )
                    )
                )
            )
        );
    }
}
