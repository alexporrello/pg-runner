#!/usr/bin/env node

import './util/log.js';

import { Command } from 'commander';

import { launchPsql } from './postgres/psql.js';
import { runScriptOrFile } from './postgres/runner.js';

export const program = new Command();

program
    .version('0.1.0')
    .option(
        '-s, --script <script>',
        'Execute an SQL script wrapped in double-quotes.'
    )
    .option('-p, --path <path>', 'Execute an .sql file.')
    .option(
        '-c, --cursors <boolean>',
        'Whether the script returns cursors.',
        false
    )
    .option(
        '-o, --output <json|table>',
        'Format of the console-printed query results',
        'table'
    )
    .action(
        (opts: {
            script?: string;
            path?: string;
            cursors?: 'true' | 'false';
            output: 'table' | 'json';
        }) => {
            runScriptOrFile(
                opts.script,
                opts.path,
                opts.cursors === 'true',
                opts.output
            );
        }
    )
    .command('psql')
    .description('Opens a psql session.')
    .action(() => launchPsql());

program.showHelpAfterError(true);

program.parse(process.argv);
