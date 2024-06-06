import { execute } from './execute.js';

export const runScriptOrFile = (
    script?: string,
    path?: string,
    cursors?: boolean,
    output?: 'table' | 'json'
) => {
    execute(script, path, cursors, output).subscribe();
};
