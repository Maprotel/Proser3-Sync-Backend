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
const originDatabase = 'asteriskcdrdb';
const originTable = "cdr";
const originDateField = "calldate";
const originNumberField = "id";

// DESTINY
const destinyTable = "MainCdr";
const destinyDateField = "cdr_calldate";
const destinyNumberField = "cdr_id";


async function readProcessEnv() {
  return process.env;
}


/******************* Running actual program -- exec*/
export async function extractMainCdr(incomingDate?: any) {


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
          let regex = /(?<=\/)[0-9]+/g
          x.cdr_data = JSON.stringify(x);

          x.cdr_id = x.id;
          x.cdr_date = moment(x.calldate, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD");
          x.cdr_time = moment(x.calldate, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss");
          x.cdr_agent_id = regex.exec(x.dstchannel); //x.dcontext === 'ext-queues' ? regex.exec( x.dstchannel ) : null;
          x.cdr_queue_number = x.dcontext === 'ext-queues' ? x.dst : null;
          x.cdr_chk = 1;
          x.cdr_uniqueid = x.uniqueid;

          return x
        })
        .map((y: any) => {

          delete y.calldate;
          delete y.clid;
          delete y.src;
          delete y.dst;
          delete y.dcontext;
          delete y.channel;
          delete y.dstchannel;
          delete y.lastapp;
          delete y.lastdata;
          delete y.duration;
          delete y.billsec;
          delete y.disposition;
          delete y.amaflags;
          delete y.accountcode;
          delete y.uniqueid;
          delete y.userfield;
          delete y.recordingfile;
          delete y.cnum;
          delete y.cnam;
          delete y.outbound_cnum;
          delete y.outbound_cnam;
          delete y.dst_cnam;
          delete y.did;
          delete y.id


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

  return "extractMainCdr end";
}

/************************************************************************ */

// npx ts-node src/sync/extract/extractMainCdr.ts

// extractMainCdr(incomingDate);
