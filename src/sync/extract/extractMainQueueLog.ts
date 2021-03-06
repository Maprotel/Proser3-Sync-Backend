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
const originDatabase = 'asterisk';
const originTable = "queuelog";
const originDateField = "time";
const originNumberField = "id";

// DESTINY
const destinyTable = "MainQueueLog";
const destinyDateField = "queuelog_datetime_init";
const destinyNumberField = "queuelog_id";


async function readProcessEnv() {
  return process.env;
}


/******************* Running actual program -- exec*/
export async function extractMainQueueLog(incomingDate?: any) {


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
          x.queuelog_data = JSON.stringify(x);

          x.queuelog_id = x.id;
          x.queuelog_date = moment(x.time, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
          x.queuelog_time = moment(x.time, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss");
          x.queuelog_chk = 1;

          x.queuelog_uniqueid = x.callid;
          x.queuelog_queue_number = x.queuename;
          x.queuelog_event = x.event;

          return x
        })
        .map((y: any) => {
          delete y.id;
          delete y.time;
          delete y.callid;
          delete y.queuename;
          delete y.agent;
          delete y.event;
          delete y.data;
          delete y.data1;
          delete y.data2;
          delete y.data3;
          delete y.data4;
          delete y.data5;
          delete y.created;
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

  return "extractMainQueueLog end";
}

/************************************************************************ */

// npx ts-node src/sync/extract/extractMainQueueLog.ts

// extractMainQueueLog(incomingDate);
