import { existsSync } from 'fs';
import { concatMap, map } from 'rxjs';

import { formatQuery } from '../cli/format-query.js';
import { initialize } from '../cli/initialize.js';
import { RxClient } from './client.js';

export const execute = (
    script?: string,
    path?: string,
    cursors: boolean = false,
    output: 'table' | 'json' = 'table'
) => {
    if (path && !existsSync(path)) {
        throw new Error(
            'Error: You must point to a valid system path. Both absolute and relative paths are acceptable.'
        );
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
                console.log(
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
