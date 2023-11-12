const exp = require('constants');
const express = require('express')
const path = require('path')
const app = express()
const static = require('serve-static')
const sqlite3 = require('sqlite3').verbose();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/public', static(path.join(__dirname, 'public')))


// 회원가입 버튼 눌렸다면
app.post('/process/adduser', (req, res)=>{
  console.log('/process/adduser 호출됨' +req)

  const paramId = req.body.id
  const paramName = req.body.name
  const paramDOB = req.body.dob
  const paramSchool = req.body.school
  const paramPhoneNum = req.body.pn

  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // insert one row into the VOLUNTEERS table
  db.run(
    `INSERT INTO VOLUNTEERS (vID, vName, DOB, sName, phoneNum, accumCNT) VALUES (?, ?, ?, ?, ?, ?);`,
    [paramId, paramName, paramDOB, paramSchool, paramPhoneNum, 0],
    function (err) {
        if (err) {
          console.log("SQL 실행시 오류 발생함")
          console.dir(err);
          return 
        }
        if (result) {
          console.dir(result);
          console.log(`(Insert Successed!)A row has been inserted with rowid ${this.lastID}!`);
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>회원가입 성공</h2>');
          res.end();
        }
        else {
          console.log("Inserted Failed");
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>volunter table에 Insert 실패</h2>');
          res.end();
        }
    }
  );
  // close the database connection
  db.close();
})

// update 
// let sql1 = `UPDATE VOLUNTEERS SET phoneNum = '010-1111-2222' WHERE sName = '이형섭'`;

// db.run(sql1, function (err) {
//     if (err) {
//         return console.error(err.message);
//     }
//     console.log(`Row(s) updated: ${this.changes}`);
// });

// // select
// let sql2 = `SELECT * FROM VOLUNTEERS WHERE vName = '이형섭'`;

// db.all(sql2, [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
//   rows.forEach((row) => {
//     console.log(row);
//   });
// });


app.listen(5500, () => {
  console.log('listening on port 5500')
})