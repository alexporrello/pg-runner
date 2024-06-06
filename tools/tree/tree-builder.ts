import { concatMap, last, map, mergeMap, of, scan, tap } from 'rxjs';
import chalk from 'chalk';

import { InitializeParams } from '../cli/initialize.js';
import { RxClient } from '../pg/rx-client.js';

const selectTable = (schema?: string) => `
SELECT
    table_catalog,
    table_schema,
    table_name,
    is_typed
 FROM information_schema.tables
WHERE is_insertable_into = 'YES'
  AND table_type = 'BASE TABLE'
  ${
      schema
          ? 'AND table_schema = ' + schema
          : "AND table_schema NOT IN ('pg_catalog', 'information_schema')"
  }
ORDER BY 1,2,3,4`;

const selectColumns = (t_schema: string, t_name: string) => `
SELECT 
    column_name,
    data_type,
    ordinal_position,
    column_default,
    is_nullable
 FROM information_schema.columns
WHERE table_name   = '${t_name}'
  AND table_schema = '${t_schema}'`;

export declare type TableRes = {
    table_catalog: string;
    table_schema: string;
    table_name: string;
    is_typed: string;
};

export declare type ColumnRes = {
    column_name: string;
    data_type: string;
    ordinal_position: number;
    column_default: any;
    is_nullable: string;
};

export declare type TreeBuilderRes = {
    schema: string;
    table: TableRes;
    columns: ColumnRes[];
};

export const treeBuilder = (
    params: InitializeParams,
    // @ts-ignore
    table?: string,
    schema?: string,
    log = false
) => {
    const client = new RxClient(params);

    const getTableColumns = (table: TableRes) => {
        return client
            .query<ColumnRes>(
                selectColumns(table.table_schema, table.table_name)
            )
            .pipe(
                map((queryRes) => ({
                    table,
                    columns: queryRes[0].rows
                })),
                tap((queryRes) => {
                    if (log) console.log(chalk.green('\t' + table.table_name));

                    let maxColLen: number;
                    queryRes.columns.forEach((column) => {
                        const colLength = column.column_name.length;
                        maxColLen ??= colLength;
                        if (colLength > maxColLen) maxColLen = colLength;
                    });

                    if (log)
                        queryRes.columns.forEach((tableCols) => {
                            console.log(
                                '\t\t' +
                                    tableCols.column_name +
                                    ' '.repeat(
                                        maxColLen - tableCols.column_name.length
                                    ) +
                                    '\t' +
                                    tableCols.data_type
                            );
                        });
                })
            );
    };

    const getTables = () =>
        client.query<TableRes>(selectTable(schema)).pipe(
            map((tables) => {
                // Group tables by schema
                const toReturn: Record<string, TableRes[]> = {};
                tables[0].rows.forEach((row) => {
                    toReturn[row.table_schema] ??= [];
                    toReturn[row.table_schema].push(row);
                });
                return toReturn;
            }),
            concatMap((tables) => {
                return of(...Object.keys(tables)).pipe(
                    concatMap((schema) => {
                        if (log) console.log(chalk.magenta(schema));
                        return of(...tables[schema]).pipe(
                            mergeMap((table) =>
                                getTableColumns(table).pipe(
                                    map((res) => ({
                                        schema,
                                        ...res
                                    }))
                                )
                            )
                        );
                    })
                );
            })
        );

    return client.connect().pipe(
        concatMap(() => getTables()),
        scan((trees, tree) => {
            trees[tree.schema] ??= {};
            trees[tree.schema][tree.table.table_name] = tree;
            return trees;
        }, {} as Record<string, Record<string, TreeBuilderRes>>),
        last(),
        concatMap((res) => client.end().pipe(map(() => res)))
    );
};
