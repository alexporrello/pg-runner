import { PathLike } from 'fs';
import { FileHandle, readFile } from 'fs/promises';
import { Observable, concatMap, of } from 'rxjs';
import { logErr } from './log.js';

export const parseJSON = <T>(val: string) =>
    new Observable<T>((subscriber) => {
        try {
            subscriber.next(JSON.parse(val) as T);
        } catch (err) {
            logErr('Error: Failed to parse JSON. Returning string.');
            logErr(err);
            subscriber.next(val as T);
        }
    });

export function readFileRx(path: PathLike | FileHandle): Observable<string>;

export function readFileRx(
    path: PathLike | FileHandle,
    options: {
        parse: false;
    }
): Observable<string>;

export function readFileRx<T>(
    path: PathLike | FileHandle,
    options: {
        parse: true;
    }
): Observable<T>;

export function readFileRx<T>(
    path: PathLike | FileHandle,
    options?: {
        parse?: boolean;
    }
): Observable<T | string> {
    return new Observable<string>((subscriber) => {
        readFile(path, 'utf-8')
            .then((val) => subscriber.next(val))
            .catch((error) => subscriber.error(error))
            .finally(() => subscriber.complete());
    }).pipe(
        concatMap((val) => {
            return options?.parse ? parseJSON<T>(val) : of(val as T);
        })
    );
}
