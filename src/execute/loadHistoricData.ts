// VENDOR
require(`dotenv`).config();
import moment = require('moment');
const {
  setIntervalAsync,
  clearIntervalAsync
} = require('set-interval-async/dynamic')


// LOCALS
import { consoleMessage } from '../helpers/consoleMessages'
import { validDateOrToday } from '../helpers/validDateOrToday';
import { extractMainAudit } from '../sync/extract/extractMainAudit';
import { extractMainCallEntry } from '../sync/extract/extractMainCallEntry';
import { extractMainCdr } from '../sync/extract/extractMainCdr';
import { extractMainQueueLog } from '../sync/extract/extractMainQueueLog';

import { readOriginTreadsConnected } from './loadFunctions';


// ENVIRONMENT
let incomingDate = process.argv[2];
let incomingMinDate = process.argv[3];

// HOST
const originMinDate = process.env.ORIGIN_MIN_DATE;
const destinyDatabase = process.env.PROSER_REPORTS_DATABASE
const intervalTime = process.env.LOAD_HISTORY_INTERVAL

// EXECUTE
async function loadDay() {
  // ACCEPT A VALID INPUT DATE OR USE TODAY
  let startDate = validDateOrToday(incomingDate);

  extractMainAudit(startDate);

}


// Run historic
async function loadHistoricData() {

  const originMinDate = process.env.ORIGIN_MIN_DATE;
  const destinyDatabase = process.env.PROSER_REPORTS_DATABASE
  const intervalTime = process.env.LOAD_HISTORY_INTERVAL


  let result = null;
  let date = validDateOrToday(incomingDate);
  let min_date = incomingMinDate ? incomingMinDate : originMinDate;

  try {


    setIntervalAsync(() => {
      console.log('');
      consoleMessage('yellow', `/*************/ HISTORIC ${date} -- ${min_date}  /*************/`)

      let threadsConnected = readOriginTreadsConnected()

      extractMainAudit(date);
      extractMainCallEntry(date);
      extractMainCdr(date);
      extractMainQueueLog(date);


      date = previousDate(date);
      if (date === min_date) {
        date = moment().format("YYYY-MM-DD");
      }
    }, 30000);

  } catch (error) {
    result = { error: error };
    console.log("Error loadHistoricData", error);
  }
}


// Get previous date
function previousDate(date: string) {
  let formated_date = moment().format("YYYY-MM-DD");
  let startdate = moment(date);
  let previous_date = startdate.subtract(1, "days");
  formated_date = startdate.format("YYYY-MM-DD");
  return formated_date;
}

// Set interval time
async function setTime() {
  return 30000
}


/************************************************************************ */

// npx ts-node src/execute/loadHistoricData.ts

loadHistoricData()