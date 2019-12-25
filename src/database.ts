// MODULES
require(`dotenv`).config();
import { createPool } from 'mysql2/promise';

export async function local() {

  const connection = await createPool({
    connectionLimit: 100,
    connectTimeout: 60 * 60 * 1000,
    host: 'localhost',
    user: 'maprotel',
    password: 'M4pr0t3l',
    multipleStatements: true,
    insecureAuth: true,
    dateStrings: true
  });

  return connection;
}


// ORIGIN
export async function origin() {

  const connection = await createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    host: process.env.ORIGIN_DB_HOST,
    user: process.env.ORIGIN_DB_USER,
    password: process.env.ORIGIN_DB_PASSWORD,
    multipleStatements: true,
    insecureAuth: true,
    dateStrings: true
  });

  return connection;
}

// REPORTS
export async function destinyReports() {

  const connection = await createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    host: process.env.REPORTS_DB_HOST,
    user: process.env.REPORTS_DB_USER,
    password: process.env.REPORTS_DB_PASSWORD,
    database: process.env.PROSER_REPORTS_DATABASE,
    multipleStatements: true,
    insecureAuth: true,
    dateStrings: true
  });

  return connection;
}




// REPORTS DESTINY
export async function destinyInventory() {

  const connection = await createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    host: process.env.INVENTORY_DB_HOST,
    user: process.env.INVENTORY_DB_USER_WRITE,
    password: process.env.INVENTORY_DB_PASSWORD_WRITE,
    database: process.env.PROSER_INVENTORY_DATABASE,
    multipleStatements: true,
    insecureAuth: true,
    dateStrings: true
  });

  return connection;
}

// REPORTS ORIGIN
export async function originInventory() {

  const connection = await createPool({
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    host: process.env.INVENTORY_DB_HOST,
    user: process.env.INVENTORY_DB_USER_READ,
    password: process.env.INVENTORY_DB_PASSWORD_READ,
    database: process.env.PROSER_INVENTORY_DATABASE,
    multipleStatements: true,
    insecureAuth: true,
    dateStrings: true
  });

  return connection;
}
