`use strict`
const { exec } = require('child_process');
const express = require('express')
const path = require('path')
const static = require('serve-static')
const sqlite3 = require('sqlite3').verbose();
const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use('/public', static(path.join(__dirname, 'public'))); // pubilc에 대한 요청에서 현재 디렉토리에 있는 pubilc 디렉토리를 루트 디렉토리로 한다.
console.log('현재 디렉토리 : ' + __dirname);

// 회원가입 page로 안내
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/adduser.html')
})
// loging page로 안내
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html')
})

// 회원가입 버튼 눌렸다면
app.post('/process/adduser', (req, res) => {
  console.log('/process/adduser 호출됨' +req)

  const paramId = req.body.id
  const paramName = req.body.name
  const paramDOB = req.body.dob
  const paramSchool = req.body.school
  const paramPhoneNum = req.body.pn
  // 받아온 data 출력
  console.log('requested parameters : ' + paramId + ', ' + paramName + ', ' + paramDOB + ', ' + paramSchool + ', ' + paramPhoneNum);
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.run(
    // DB의 VOLUNTEERS 테이블에 새로운 tuple(회원) 추가
    `INSERT INTO VOLUNTEERS (vID, vName, DOB, sName, phoneNum, accumCNT) VALUES (?, ?, ?, ?, ?, ?);`,
    [paramId, paramName, paramDOB, paramSchool, paramPhoneNum, 0],
    function (err) {
        if (err) {
          console.log("SQL Query 실행시 Error.")
          console.dir(err);
          // 이미 존재하는 아이디라면, 회원가입 실패
          if(err.errno == 19) {
            res.sendFile(__dirname + '/public/signup_failure.html');
          }
          return
        }
        if (res) {
          // console.dir(res);
          console.log(`(Insert Successed!)A row has been inserted with rowid ${this.lastID}!`);
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>회원가입 성공</h2>');
          res.end();
        }
        else {
          console.log("Inserted Failed");
          res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
          res.write('<h2>회원가입에 실패하였습니다. </h2>');
          res.end();
        }
    }
  );
  // close the database connection
  db.close();
})

app.listen(5500, () => {
  console.log('listening on port 5500')
})