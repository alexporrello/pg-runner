#!/usr/bin/env node

import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import { concatMap } from 'rxjs';
import { exit } from 'process';

import {__dirname} from './dirname.js'
import { args, findArg } from './util/parse-args.js';
import { formatSQL } from './formatter/sql-formatter.js';
import { initialize } from './cli/initialize.js';
import { launchSQLRunner } from './runner/runner.js';
import { treeBuilder } from './tree/tree-builder.js';


export const printHelp = () => {
    console.log(readFileSync(join(__dirname, '..', 'help.txt'), 'utf-8'));
    exit(0);
};

if (args.includes('help') || args.includes('--help') || args.includes('-h'))
    printHelp();

if (args.includes('tree')) {
    const schema = findArg('-s', '--schema');
    const table = findArg('-t', '--table');

    initialize()
        .pipe(concatMap((params) => treeBuilder(params, schema, table)))
        .subscribe();
} else {
    let path = findArg('format', 'format');

    if (path) {
        formatSQL(resolve(path));
    } else {
        launchSQLRunner();
    }
}
