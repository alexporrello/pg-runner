import { argv } from 'process';

/** The args, not including default paths. */
export const args = argv.slice(2);

export const includesArg = (arg: string) => args.includes(arg);

/**
 * Parses cli arguments from `process.argv`.
 * @param short The short version of the argument (ex. `-p` for path)
 * @param long The long version of the argument (ex. `--path` for path)
 * @param type (optional) The parsed type of the argument
 * @returns The argument (parsed if `type` is provided) or null.
 */
export function findArg(short: string, long: string, type?: 'string'): string;

/**
 * Parses cli arguments from `process.argv`.
 * @param short The short version of the argument (ex. `-p` for path)
 * @param long The long version of the argument (ex. `--path` for path)
 * @param type The parsed type of the argument
 * @returns The argument (parsed if `type` is provided) or null.
 */
export function findArg(
    short: string,
    long: string,
    type: 'number'
): number | null;

/**
 * Parses cli arguments from `process.argv`.
 * @param short The short version of the argument (ex. `-p` for path)
 * @param long The long version of the argument (ex. `--path` for path)
 * @param type The parsed type of the argument
 * @returns The argument (parsed if `type` is provided) or null.
 */
export function findArg(
    short: string,
    long: string,
    type: 'boolean'
): boolean | null;

export function findArg(
    short: string,
    long: string,
    type?: 'boolean' | 'number' | 'string'
) {
    const getArg = () => {
        const getArg = (argv: string) => {
            if (args.includes(argv)) {
                const arg = args[args.indexOf(argv) + 1];

                if (arg) return arg;
                else {
                    const arg = args[args.indexOf(argv)]
                        .split('=')
                        .map((arg) => arg.trim());
                    if (arg.length === 2) return arg[1];
                }
            }

            return null;
        };

        const short_arg = getArg(short);
        if (short_arg) return short_arg;
        const long_arg = getArg(long);
        if (long_arg) return long_arg;

        return null;
    };

    const arg = getArg();
    if (arg) {
        switch (type) {
            case 'boolean':
                return arg === 'true';
            case 'number':
                const argParsed = Number(arg);
                if (!isNaN(argParsed)) return argParsed;
                else return null;
            default:
                return arg;
        }
    }

    return null;
}
