const express = require('express')
const sqlite3 = require('sqlite3').verbose(); 
const path = require('path')
const static = require('serve-static')

const path = require('path'); // path 모듈 불러와서 변수에 담기
const dbPath = path.resolve(__dirname, './db/Tproject.db');


let db = new sqlite3.Database('./db/Tproject.db'/*dbPath*/, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
        console.error(dbPath);
    } else {
        console.log('Connected to the database.');
    }
}); // db sqlite3 db에 연결하는 코드!!

db.close((err) =>{
  if(err){
    console.error(err.message);
  }
  console.log('Close the database connection.');
}); // db 닫는 코드!!