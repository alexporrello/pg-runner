import { existsSync, readFileSync } from 'fs';
import { logErr } from '../util/log.js';
import { printHelp } from '../cli.js';

const to_upper = ['boolean', 'character', 'varying', 'numeric'];

export const formatSQL = (path: string) => {
    if (!existsSync(path)) {
        logErr('Path specified by [--format | -f] command does not exist.');
        printHelp();
    }

    const file = readFileSync(path, 'utf-8');
    const out = file
        .split(/\n/g)
        .map((newlines) =>
            newlines
                .split(/\(/g)
                .map((insideParens) =>
                    insideParens
                        .split(/\)/g)
                        .map((outsideParens) => {
                            console.log(outsideParens);
                            return outsideParens
                                .split(/\s/g)
                                .map((fragment) => {
                                    if (fragment.trim().length === 0)
                                        return fragment;

                                    if (to_upper.includes(fragment.trim())) {
                                        return fragment.toUpperCase();
                                    }

                                    return fragment;
                                })
                                .join(' ');
                        })
                        .join(')')
                )
                .join('(')
        )
        .join('\n')
        .replace(/\n\(/g, ' (')
        .replace(/(WITH|with)\s\((\s{1,}|\n)/g, 'WITH (')
        .replace(/\n\)/g, ')');

    console.log(out);
};
