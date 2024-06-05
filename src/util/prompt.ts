import inq from 'inquirer';

import { QuestionCollection } from 'inquirer';
import { Observable } from 'rxjs';

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
