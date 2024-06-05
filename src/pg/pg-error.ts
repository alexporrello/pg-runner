import chalk from 'chalk';

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
