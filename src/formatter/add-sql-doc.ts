export const findNextCreateTable = (editorText: string, cursorPosn: number) => {
    try {
        let nextTable = editorText.split('\n').splice(cursorPosn).join('\n');
        nextTable = nextTable
            .substring(nextTable.toLowerCase().indexOf('create table'))
            .trim();
        nextTable = nextTable.substring(0, nextTable.indexOf(';') + 1);

        let tableBody = nextTable
            .substring(
                nextTable.indexOf('(' + 1),
                nextTable.lastIndexOf(')') + 1
            )
            .replace(/\s{2,}|\n|\t/g, ' ');
        tableBody = tableBody.replace(/,\s/g, ',');
        return tableBody;
    } catch (e) {}
};

export const extractName = (declaration?: string) => {
    const name = declaration?.split(/\s/g).pop();
    if (name) {
        const split = name.split('.');
        if (split.length === 2) {
            return ['@table  ' + split[1], '@schema ' + split[0]];
        } else {
            return ['@table ' + split[0]];
        }
    } else return '';
};

export const extractColumns = (params: string) => {
    const columns: string[] = [];

    params.split(',').map((line) => {
        const split = line.split(/\s/g);
        let variable = split.shift();
        let type = split.shift();

        switch (type?.toLowerCase()) {
            case 'character':
                type = 'CHARACTER VARYING';
                break;
            case 'constraint':
                break;
        }

        if (type && variable) {
            columns.push(`@column {${type} ${variable}`);
        }
    });

    return columns;
};

export const extractConstraints = (constraints: string) => {
    const constraintsDocs: string[] = [];

    constraints.split(/CONSTRAINT/gi).forEach((constraint) => {
        if (constraint.length > 0) {
            const segments = constraint
                .split(/\s/g)
                .filter((val) => val.trim().length > 0);
            const constraintName = segments.shift();

            if (segments[0].match(/primary/gi)) {
                const primaryKey = segments.pop()?.replace(/\(|\)|,/g, '');

                constraintsDocs.push(
                    `@primaryKey (${primaryKey}) ${constraintName}`
                );
            } else {
                const split = constraint
                    .split(' ')
                    .filter((seg) => seg.trim().length > 0);

                let localCol: string | undefined;
                let refTable: string | undefined;
                let refCol: string | undefined;

                split.forEach((val, index) => {
                    if (val.match(/key/gi)) {
                        localCol = split[index + 1].replace(/\(|\)/g, '');
                    }
                    if (val.match(/references/gi)) {
                        refTable = split[index + 1];
                        refCol = split[index + 2].replace(/\(|\)/g, '');
                    }
                });

                if (constraintName && localCol && refTable && refCol) {
                    constraintsDocs.push(
                        `@foreignKey (${localCol}) ${constraintName} => ${refTable}.${refCol}`
                    );
                }
            }
        }
    });

    return constraintsDocs;
};

export const extractDocParts = (createTable: string) => {
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
