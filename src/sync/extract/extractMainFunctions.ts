import { local, origin, destinyReports } from "../../database";
import { removeRowDataPacket } from "../../helpers/mysqlHelper";
import moment = require('moment');


// Read current records
export async function readOriginByDate(
  startDate: string,
  databaseName: string,
  tableName: string,
  dateFieldName: string
) {

  let readResult = null;

  // SELECT CONNECTION WITH HOST SERVER
  let conn = await origin();

  // DEFINE QUERY IN SQL
  let querySQL = `
  SELECT
  *
  FROM
  ${databaseName}.${tableName}
  WHERE
  CAST(${dateFieldName} AS DATE) = '${startDate}'
  `;
  ;

  // GET DATA FROM HOST SERVER
  try {
    let result = await conn.query(querySQL);
    readResult = removeRowDataPacket(result[0])//JSON.parse(JSON.stringify(readResult[0]));
    conn.end();
    return readResult

  } catch (error) {
    readResult = { error: error };
    console.error('readResult-error', readResult);
    conn.end();
    return [];
  }

}


// Write processed records
export async function writeDestiny(
  data: any,
  tableName: string
) {

  let writeResult = null;
  let databaseName = process.env.PROSER_REPORTS_DATABASE

  // SELECT CONNECTION WITH HOST SERVER
  let conn = await local();

  try {

    if (data[0] !== undefined) {

      // Get field names
      let myfields = Object.keys(data[0]);

      // Get all valid records to insert
      let myRecords = data.map((x: any) => {
        return Object.values(x);
      });

      // Get update values
      let updateFieldsArray = myfields.map((x, index) => {
        return `${x} = VALUE(${x})`;
      });

      let updateFields = updateFieldsArray;

      // Define insert query
      let querySQL = `
      INSERT INTO  ${databaseName}.${tableName} (${myfields}) 
      values ?
    
      ON DUPLICATE KEY UPDATE ${updateFields}
    `;
      writeResult = await conn.query(querySQL, [myRecords])
      conn.end();
      return writeResult

    } else {
      return 'No hay data'
    }

  } catch (error) {
    writeResult = { error: error };
    console.error('writeResult-error', writeResult);
    conn.end();
    return [];
  }

}
