import chalk from 'chalk';

const error = console.error;
console.error = (message?: any, ...optionalParams: any[]) => {
    if (message) error(chalk.red(message));
    optionalParams.forEach((param) => error(chalk.red(param)));
};

const debug = console.debug;
console.debug = (message?: any, ...optionalParams: any[]) => {
    if (message) debug(chalk.yellow(message));
    optionalParams.forEach((param) => chalk.yellow(param));
};

const info = console.info;
console.info = (message?: any, ...optionalParams: any[]) => {
    if (message) info(chalk.green(message));
    optionalParams.forEach((param) => info(chalk.green(param)));
};
