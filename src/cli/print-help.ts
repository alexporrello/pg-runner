import chalk from 'chalk';

const tokenize = (helpText: string, cliNm: string) => {
    helpText = helpText.replace(new RegExp(cliNm, 'g'), 'Θ');

    const split = helpText.split(/|/g);
    let nextChar: string | undefined;

    const consume = (
        token: string,
        end: (token: string) => boolean,
        removeTags = false
    ) => {
        if (removeTags) token = '';

        while ((nextChar = split.shift())) {
            if (end(nextChar)) return removeTags ? token : token + nextChar;
            token = token + nextChar;
        }

        return token;
    };

    let text = '';

    while ((nextChar = split.shift())) {
        if (nextChar === '_') {
            let command = consume('_', (token) => token === '_', true);
            text = text + chalk.green(command);
            continue;
        }

        if (nextChar === '[') {
            text += chalk.blue(consume('[', (token) => token === ']'));
            continue;
        }

        if (nextChar === '<') {
            text += chalk.yellow(consume('<', (token) => token === '>'));
            continue;
        }

        if (nextChar === '-') {
            nextChar = split.shift();
            if (nextChar && nextChar === '-') {
                text = text += chalk.magenta(
                    consume('--', (token) => /\n|\s/.test(token))
                );
            } else if (nextChar) split.unshift(nextChar);
            continue;
        }

        text = text + nextChar;

        continue;
    }

    return text.replace(new RegExp('Θ', 'g'), cliNm);
};

/**
 * Formats and prints the `help.txt`.
 * @param helpText The path to the `help.txt file.
 */
export const printHelp = (command: string, helpText: string) => {
    console.log(tokenize(helpText, command));
};
