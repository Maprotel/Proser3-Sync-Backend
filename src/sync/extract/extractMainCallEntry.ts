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
const originTable = "call_entry";
const originDateField = "datetime_entry_queue";
const originNumberField = "id";

// DESTINY
const destinyTable = "MainCallEntry";
const destinyDateField = "callentry_date";
const destinyNumberField = "callentry_id";


async function readProcessEnv() {
  return process.env;
}


/******************* Running actual program -- exec*/
export async function extractMainCallEntry(incomingDate?: any) {


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
          x.callentry_data = JSON.stringify(x);

          x.callentry_id = x.id;
          x.callentry_date = moment(x.datetime_entry_queue, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
          x.callentry_time = moment(x.datetime_entry_queue, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss");
          x.callentry_chk = x.datetime_end ? 1 : 0;

          x.callentry_agent_id = x.id_agent;
          x.callentry_queue_id = x.id_queue_call_entry;

          return x
        })
        .map((y: any) => {
          delete y.id;
          delete y.id_agent;
          delete y.id_queue_call_entry;
          delete y.id_contact;
          delete y.callerid;
          delete y.datetime_init;
          delete y.datetime_end;
          delete y.duration;
          delete y.status;
          delete y.transfer;
          delete y.datetime_entry_queue;
          delete y.duration_wait;
          delete y.uniqueid;
          delete y.id_campaign;
          delete y.trunk

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

  return "extractMainCallEntry end";
}

/************************************************************************ */

// npx ts-node src/sync/extract/extractMainCallEntry.ts

// extractMainCallEntry(incomingDate);
