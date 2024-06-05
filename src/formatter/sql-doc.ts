import { SnippetString, window } from 'vscode';

const output = window.createOutputChannel('Shared');

const dataTypes = [
    'bigint',
    'bigserial',
    'bit',
    'bit varying',
    'boolean',
    'box',
    'bytea',
    'character',
    'character varying',
    'cidr',
    'circle',
    'date',
    'double precision',
    'inet',
    'integer',
    'interval',
    'json',
    'jsonb',
    'line',
    'lseg',
    'macaddr',
    'macaddr8',
    'money',
    'numeric',
    'path',
    'pg_lsn',
    'pg_snapshot',
    'point',
    'polygon',
    'real',
    'smallint',
    'smallserial',
    'serial',
    'text',
    'time',
    'time',
    'timestamp',
    'timestamp',
    'tsquery',
    'tsvector',
    'txid_snapshot',
    'uuid',
    'xml'
];

const extractName = (declaration?: string) => {
    const name = declaration?.split(/\s/g).pop();
    if (!name) return '';
    const split = name.split('.');
    if (split.length === 2) {
        return ['@table  ' + split[1], '@schema ' + split[0]];
    } else {
        return ['@table ' + split[0]];
    }
};

const extractColumns = (params: string) => {
    const columns: string[] = [];

    params
        .split(',')
        .map((line) => line.trim().replace(/\s{2,}/g, ' '))
        .filter((line) => line.trim().length > 0)
        .map((line) => {
            const parts = line.split(/\s/g);

            let variable = parts.shift();
            let type = parts.shift();
            let nextPart = parts.shift()?.toLowerCase();

            if (nextPart && nextPart === 'varying')
                type = type + ' ' + 'VARYING';
            if (nextPart && nextPart === 'precision')
                type = type + ' ' + 'PRECISION';

            if (type && variable) columns.push(`@column {${type}} ${variable}`);
            else if (variable) columns.push(`@column {?} ${variable}`);
            else if (type) columns.push(`@column {${type}} <?>`);
        });

    return columns;
};

const extractConstraints = (rawConstraints: string) => {
    const constraints: string[] = [];

    const extractConstraint = (constraint: string) => {
        const segments = constraint
            .trim()
            .split(/\s/g)
            .filter((val) => val.trim().length > 0)
            .map((seg) => seg.trim());

        const constraintName = segments.shift();

        if (segments[0].match(/primary/gi)) {
            const primaryKey = segments.pop()?.replace(/\(|\)|,/g, '');
            constraints.push(`@primaryKey (${primaryKey}) ${constraintName}`);
        } else {
            let localCol: string | undefined;
            let refTable: string | undefined;
            let refCol: string | undefined;

            segments.forEach((val, index) => {
                if (val.match(/key/gi)) {
                    localCol = segments[index + 1].replace(/\(|\)/g, '');
                }
                if (val.match(/references/gi)) {
                    refTable = segments[index + 1];
                    refCol = segments[index + 2].replace(/\(|\)/g, '');
                }
            });

            if (constraintName && localCol && refTable && refCol) {
                constraints.push(
                    `@foreignKey (${localCol}) ${constraintName} => ${refTable}.${refCol}`
                );
            }
        }
    };

    rawConstraints.split(/constraint/gi).forEach((constraint) => {
        if (constraint.length > 0) extractConstraint(constraint);
    });

    return constraints;
};

const extractDocParts = (createTable: string) => {
    const bodyIndex = createTable.indexOf('(');
    const constraintIndex = createTable.toLowerCase().indexOf('constraint');

    const declaration = extractName(createTable.slice(0, bodyIndex).trim());
    const params = extractColumns(
        createTable.slice(bodyIndex + 1, constraintIndex).trim()
    );
    const constraints = extractConstraints(
        createTable.slice(constraintIndex).trim()
    );

    return (
        '/**\n' +
        [...declaration, ...params, ...constraints]
            .map((val) => ' * ' + val)
            .join(' \n') +
        '\n */'
    );
};

const activeEditor = window.activeTextEditor;

if (activeEditor) {
    try {
        const editorText = activeEditor.document.getText();
        const cursorPosn = activeEditor.selection.active;
        const table = editorText.split('\n').splice(cursorPosn.line).join('\n');
        const nextTable = table
            .substring(
                table.toLowerCase().indexOf('create table') -
                    'create table'.length
            )
            .substring(0, table.indexOf(';') + 1);

        activeEditor.insertSnippet(
            new SnippetString(extractDocParts(nextTable.trim()))
        );
    } catch (e) {
        throw e;
    }
} else {
    throw Error('No active editor.');
}
