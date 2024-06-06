import { exit } from 'process';
import { Observable } from 'rxjs';
import { QuestionCollection } from 'inquirer';

import chalk from 'chalk';
import inq from 'inquirer';
import pg from 'pg';

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
                console.info('Client connected.');
                subscriber.next(client);
            })
            .catch((err) => {
                console.error(
                    'Error: Failed to establish connection.\n       ' +
                        params.user +
                        ':' +
                        params.database +
                        '@' +
                        params.host
                );
                console.error(err);
                exit(5);
            });
    });
}

export function clientEnd(client: pg.Client) {
    return new Observable<void>((subscriber) => {
        client
            .end()
            .then(() => {
                console.info('Connection closed');
                subscriber.complete();
            })
            .catch((err) => {
                console.error('Error: Failed to close connection.');
                subscriber.error(err);
            });
    });
}

export function clientQuery<T extends pg.QueryResultRow>(
    client: pg.Client,
    text: string
) {
    return new Observable<pg.QueryResult<T>>((subscriber) => {
        client
            .query({
                text
            })
            .then((value) => {
                subscriber.next(value);
                subscriber.complete();
            })
            .catch((err) => subscriber.error(err));
    });
}

export function prompt<T>(
    questions: QuestionCollection<any>,
    initialAnswers?: Partial<any> | undefined
) {
    return new Observable<T>((subscriber) => {
        inq.prompt(questions, initialAnswers)
            .then((response) => subscriber.next(response))
            .catch((error) => subscriber.error(error))
            .finally(() => subscriber.complete());
    });
}

export declare type PgError = {
    message: string;
    stack?: string;
    length: number;
    severity: string;
    code: string;
    detail: any;
    hint: any;
    position: any;
    internalPosition: string;
    internalQuery: string;
    where: string;
    schema: any;
    table: any;
    column: any;
    dataType: any;
    constraint: any;
    file: string;
    line: string;
    routine: string;
};

export const isPgError = (val: any): val is PgError => {
    return (
        val !== undefined &&
        val !== null &&
        typeof val == 'object' &&
        'internalQuery' in val &&
        'internalPosition' in val
    );
};

export const formatPgError = (err: PgError) => {
    console.error(chalk.red(`${err.severity}: ` + err.message));

    const query = err.internalQuery;
    const posn = Number(err.internalPosition);

    try {
        const errorPre = query.substring(0, posn - 1);
        const errorPost = query.substring(posn);
        const errorLen = errorPost.indexOf('\n');

        console.error(
            chalk.red('QUERY: ') +
                chalk.blue(errorPre) +
                chalk.red(query.substring(posn - 1, posn + errorLen)) +
                chalk.blue(query.substring(posn + errorLen))
        );
        console.error(chalk.red('CONTEXT: ' + err.where));
    } catch {
        console.error(chalk.red(err));
    }
};
