// VENDOR
require(`dotenv`).config();
import moment = require('moment');

// HELPERS
import { consoleMessage } from '../../helpers/consoleMessages'
import { validDateOrToday } from '../../helpers/validDateOrToday';
import { removeRowDataPacket } from "../../helpers/mysqlHelper";

// LOCALS
import {
  readOriginByDate,
  writeDestiny,
} from "./extractMainFunctions";


// ENVIRONMENT
let incomingDate = process.argv[2];
let testOutputLog = process.env.TEST === 'false' ? false : true;


// HOST
const originCode = process.env.ORIGIN_CODE;

// ORIGIN
const originDatabase = 'call_center';
const originTable = "audit";
const originDateField = "datetime_init";
const originNumberField = "id";

// DESTINY
const destinyTable = "MainAudit";
const destinyDateField = "audit_datetime_init";
const destinyNumberField = "audit_id";


async function readProcessEnv() {
  return process.env;
}


/******************* Running actual program -- exec*/
export async function extractMainAudit(incomingDate?: any) {


  let extractResult = null;
  let transformResult = null;
  let loadResult = null;

  // ACCEPT A VALID INPUT DATE OR USE TODAY

  let startDate = validDateOrToday(incomingDate);


  // CONSOLE OUTPUT TO START
  consoleMessage('green', `/*************/ Extracting ${originTable} to ${destinyTable} /*************/ `)
  consoleMessage('white', `startDate: ${startDate}`)

  /* EXTRACT ******************************************/
  try {
    extractResult = await readOriginByDate(
      startDate,
      originDatabase,
      originTable,
      originDateField,
    ).catch((error: any) =>
      console.error(`${originTable} caught it - readOriginByDate`, error)
    );

    testOutputLog ? console.log('extractResult', extractResult) : '';

  } catch (error) {
    console.error('Error en readOriginByDate', error);
    extractResult = 'error'
  }

  /* TRANSFORM  ******************************************/
  try {
    if (extractResult != 'error') {
      transformResult = extractResult
        .map((x: any) => {
          x.audit_data = JSON.stringify(x);

          x.audit_id = x.id;
          x.audit_date = moment(x.datetime_init, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
          x.audit_time = moment(x.datetime_init, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss");
          x.audit_chk = x.datetime_end ? 1 : 0;

          x.audit_agent_id = x.id_agent;
          x.audit_break_id = x.id_break ? x.id_break : 0;

          return x
        })
        .map((y: any) => {
          // Remove original fields
          delete y.id;
          delete y.id_agent;
          delete y.id_break;
          delete y.datetime_init;
          delete y.datetime_end;
          delete y.duration;
          delete y.ext_parked;

          return (y);
        });
    }

    testOutputLog ? console.log('transformResult', transformResult) : '';

  } catch (error) {
    console.error('Error en transformOrigin', error);
    transformResult = 'error'
  }

  /* LOAD ******************************************/
  try {

    let tempProcess = await readProcessEnv()

    if (transformResult != 'error') {
      loadResult = await writeDestiny(transformResult, destinyTable)
        .catch((error: any) =>
          console.error(`${destinyTable} caught it - writeDestiny`, error)
        );
    }

    testOutputLog ? console.log('loadResult', loadResult) : '';

  } catch (error) {
    console.error('Error en transformOrigin', error);
    loadResult = 'error'
  }

  // let temp = loadResult[0]

  (extractResult != 'error' && transformResult != 'error' && loadResult != 'error') ?
    console.log(`Proceso ${originTable} to ${destinyTable} -- ${startDate} finalizado sin errores`, removeRowDataPacket(loadResult)[0].affectedRows) :
    console.log(`Proceso ${originTable} to ${destinyTable} -- ${startDate} finalizado con errores`);

  return "extractMainAudit end";
}

/************************************************************************ */

// npx ts-node src/sync/extract/extractMainAudit.ts

// extractMainAudit(incomingDate);
