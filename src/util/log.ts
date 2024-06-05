import chalk from 'chalk';

export const logErr = (...err: any[]) => {
    console.error(chalk.red(...err));
};

export const logSuccess = (...success: any[]) => {
    console.log(chalk.green(...success));
};

export const logInfo = (...info: any[]) => {
    console.log(chalk.yellow(...info));
};
