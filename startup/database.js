const mysql = require('mysql2');
require('dotenv').config();


const plantcare = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_PC,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});


const collectionofficer = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_CO,
  charset: 'utf8mb4',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});

const marketPlace = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_MP,
  charset: 'utf8mb4',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});


const dash = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_DS,
  charset: 'utf8mb4',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});

const admin = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_AD,
  charset: 'utf8mb4',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 6, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay : 0,
});


module.exports = {plantcare, collectionofficer, marketPlace, dash, admin};