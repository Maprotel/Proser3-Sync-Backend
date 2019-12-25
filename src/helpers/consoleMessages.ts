const chalk = require("chalk");

export async function consoleMessage(color: string, msg: string) {

  let chalkColor = "#ffffff";

  color === 'red' ? chalkColor = "#E50000" : '';
  color === 'green' ? chalkColor = "#00E500" : '';
  color === 'blue' ? chalkColor = "#000010" : '';
  color === 'yellow' ? chalkColor = "#E5E510" : '';
  color === 'orange' ? chalkColor = "#E5E510" : '';


  if (msg) {
    console.log(chalk.hex(chalkColor)(msg));
  }

}