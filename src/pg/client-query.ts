import pg from 'pg';
import { Observable } from 'rxjs';

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
