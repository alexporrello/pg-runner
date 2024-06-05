import { concatMap, of } from 'rxjs';
import { resolve } from 'path';

import { readFileRx } from '../util/fs.js';
import { selectSQL } from './select-sql.js';

/**
 * Initializes a database if one hasn't been initialized.
 * @param script A quoted SQL script.
 * @param path The relative or absolute path to an SQL file
 * @param cursors Whether `script` or `path` returns cursors
 * @returns An observable of the script or the SQL file read in from disk.
 */
export const formatQuery = (
    script?: string,
    path?: string,
    cursors?: boolean
) => {
    if (script) return of(script);

    return (
        path
            ? of({
                  select_file: path,
                  cursor_res: cursors
              })
            : selectSQL()
    ).pipe(concatMap((val) => readFileRx(resolve(val.select_file))));
};
