const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');

// insert one row into the student table
db.run(`INSERT INTO VOLUNTEERS (vID, vName, DOB, sName, phoneNum, accumCNT) VALUES (4, '홍길동', '2000-09-27', '금촌고등학교', '010-2468-1357', 0);`, function (err) {
    if (err) {
        return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
});

// update 
let sql1 = `UPDATE VOLUNTEERS SET phoneNum = '010-1111-2222'
            WHERE sName = '이형섭'`;

db.run(sql1, function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);

});

// select
let sql2 = `SELECT * FROM VOLUNTEERS
           WHERE vName = '이형섭'`;

db.all(sql2, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// close the database connection
db.close();

