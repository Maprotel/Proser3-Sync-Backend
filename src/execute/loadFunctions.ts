import { local, origin, destinyReports } from "../database";
import { removeRowDataPacket } from "../helpers/mysqlHelper";
import moment = require('moment');


// Read current connections
export async function readOriginTreadsConnected() {

  let readResult = null;

  // SELECT CONNECTION WITH HOST SERVER
  let conn = await origin();

  // DEFINE QUERY IN SQL
  let querySQL = `
  SHOW STATUS WHERE variable_name = 'Threads_connected'
  `

  // GET DATA FROM HOST SERVER
  try {
    let result = await conn.query(querySQL);
    readResult = removeRowDataPacket(result[0])

    console.log('result', readResult);

    conn.end();


    return readResult

  } catch (error) {
    readResult = { error: error };
    console.error('readResult-error', readResult);
    conn.end();
    return [];
  }

}

/************************************************************* */

// npx ts-node src/execute/loadFunctions.ts
readOriginTreadsConnected()