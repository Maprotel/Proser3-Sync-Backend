// VENDOR
import moment = require('moment');

// EXECUTE
export function validDateOrToday(dateToValidate: any): string {
  // ACCEPT A VALID INPUT DATE OR USE TODAY
  let valDate = moment(dateToValidate).isValid();
  dateToValidate = valDate === true ? dateToValidate : moment().format("YYYY-MM-DD");
  dateToValidate = dateToValidate ? dateToValidate : moment().format("YYYY-MM-DD");
  dateToValidate = !isNaN(dateToValidate) ? moment().format("YYYY-MM-DD") : dateToValidate;

  return dateToValidate
}