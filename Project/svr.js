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

// main page로 안내
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/main.html')
})
// volunteer's login page로 안내
app.get('/volunteer_login', (req, res) => {
  res.sendFile(__dirname + '/public/volunteer_login.html')
})
// volunteer's signup page로 안내
app.get('/volunteer_signup', (req, res) => {
  res.sendFile(__dirname + '/public/volunteer_signup.html')
})
// wc's login page로 안내
app.get('/wc_register', (req, res) => { 
  res.sendFile(__dirname + '/public/wc_register.html')
})
// volunteer's signup 버튼 눌렸다면
app.post('/process/volunteer_signup', (req, res) => {
  console.log('/process/volunteer_signup 호출됨' +req)

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
          // 이미 존재하는 아이디라면, signup failure page로 안내
          if(err.errno == 19) {
            res.sendFile(__dirname + '/public/volunteer_signup_failure.html');
          }
          return
        }
        if (res) {
          // console.dir(res);
          console.log("회원가입 성공!");
          // 회원가입 성공하면, signup success page로 안내
          res.sendFile(__dirname + '/public/volunteer_signup_success.html');
        }
        else {
          console.log("Inserted Failed");
          res.sendFile(__dirname + '/public/volunteer_signup_failure.html');
        }
    }
  );
  // close the database connection
  db.close();
})

// volunteer's login 버튼 눌렸다면
app.post('/process/volunteer_login', (req, res) => {
  console.log('/process/volunteer_login 호출됨' +req)

  const paramId = req.body.id
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 VOLUNTEERS 테이블에서 id가 일치하는 tuple(회원) 검색
    `SELECT * FROM VOLUNTEERS WHERE vID = ?;`,
    [paramId],
    function (err, rows) {
        console.log("res : " + res);
        if (err) {
          console.log("SQL Query 실행시 Error.")
          console.dir(err);
          return
        }
        if (rows.length > 0) {
          console.log("Login Successed!");
          res.sendFile(__dirname + '/public/volunteer_main.html');
        }
        else {
          console.log("Login Failed");
          res.sendFile(__dirname + '/public/volunteer_login_failure.html');
        }
    }
  );
  // close the database connection
  db.close();
})

// service 등록 버튼 눌렸다면
app.post('/process/wc_register', (req, res) => {
  console.log('/process/wc_register 호출됨' +req)

  const param_wcName = req.body.wcName
  const param_olderName = req.body.olderName
  const param_olderPN = req.body.olderPN
  const param_sDescribe = req.body.sDescribe
  // 받아온 data 출력
  console.log('requested parameters : ' + param_wcName + ', ' + param_olderName + ', ' + param_olderPN + ', ' + param_sDescribe);
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 WELFARCENTERS 테이블에 param_wcName이 일치하는 wcName가 있는지 확인
    `SELECT * FROM WELFARECENTERS WHERE wcName = ?;`,
    [param_wcName],
    function (err, rows) {
      console.log("res : " + res);
      if (err) {
        console.log("SQL Query 실행시 Error.")
        console.dir(err);
        return
      }
      if (rows.length > 0) {
        console.log("wcName이 존재합니다.");
        // DB의 SERVICES 테이블에 새로운 service(공고) 추가
        db.all(
          `INSERT INTO SERVICES (sNum, vName, vPhoneNum, isFinish, isAssign, wcName, vID, sDescribe) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          // sNum은 primary key이므로 자동으로 증가하게끔 설정
          [null, param_olderName, param_olderPN, 'N', 'N', param_wcName, null, param_sDescribe],
          function (reg_err) {
            if (reg_err) {
              console.log("SQL Query 실행시 Error.")
              console.dir(reg_err);
              res.send({result:"Insert Failed"});
              
              return
            }
            if (res) {
              // console.dir(res);
              console.log("Register Success!");
              // 공고 등록이 성공하면, wc register success page로 안내
              res.send({result:"success"});
            }
            else {
              console.log("Inserted Failed");
              res.send({result:"Insert Failed"});
            }
          }
        )
      }
      else{
        console.log("wcName이 존재하지 않습니다.");
        res.send({result:"No wcName"});
      }
    }
  );
  // close the database connection
  db.close();
})

// wc_register.html에서 게시된 공고 확인하기
app.post('/process/search_service_from_db', (req, res) => {
  console.log('/process/search_service_from_db 호출됨' +req)

  const param_wcName = req.body.wcName
  // 받아온 data 출력
  console.log('requested parameters : ' + param_wcName);
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 SERVICES 테이블에서 wcName이 일치하는 공고들을 return
    `SELECT * FROM SERVICES WHERE wcName = ?;`,
    [param_wcName],
    function (err, rows) {
      console.log("res : " + res);
      if (err) {
        console.log("SQL Query 실행시 Error.")
        console.dir(err);
        return
      }
      if (rows.length > 0) {
        console.log(param_wcName+"에 공고가 존재합니다.");
        // 공고들이 담겨있는 rows를 client에게 전송 (res.result="success"와 res.rows=rows)  
        rows = JSON.stringify(rows);
        console.log("rows : " + rows);
        res.send({result:"success", rows:rows});
      }
      else{
        console.log("공고가 존재하지 않습니다.");
        res.send({result:"NoService"});
      }
    }
  );
  // close the database connection
  db.close();
})

// wc_register.html에서 "취소" button에 대한 처리
app.post("/process/cancel_service_from_db", (req, res) => {
  console.log('/process/cancel_service_from_db 호출됨' +req)

  const param_sNum = req.body.sNum
  // 받아온 data 출력
  console.log('requested parameters : ' + param_sNum);
  
  // DB object 생성
  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  // DB open
  db.all(
    // DB의 SERVICES 테이블에서 sNum이 일치하는 공고를 삭제
    `DELETE FROM SERVICES WHERE sNum = ?;`,
    [param_sNum],
    function (err, rows) {
      console.log("rows : " + rows);
      if (err) {
        console.log("SQL Query 실행시 Error.")
        console.dir(err);
        return
      }
      if (res) {
        console.log(param_sNum+" service를 삭제했습니다.");
        res.send({result:"success"});
      }
      else{
        console.log(param_sNum+" service가 존재하지 않습니다.");
        res.send({result:"failure"});
      }
    }
  );
  // close the database connection
  db.close();
})

// wc_register.html에서 "완료" button에 대한 처리
app.post('/process/finish_service_from_db', (req, res) => {
  console.log('/process/finish_service_from_db 호출됨' + req);

  const param_sNum = req.body.sNum;
  const param_vID = req.body.vID;
  // 받아온 data 출력
  console.log('requested parameters : ' + param_sNum + ', ' + param_vID);

  var db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
  db.all(
    // 1. DB의 VOLUNTEERS 테이블에서 vID가 일치하는 회원이 있는지 확인
    `SELECT * FROM VOLUNTEERS WHERE vID = ?;`,
    [param_vID],
    function (err, rows) {
      console.log("res : " + res);
      if (err) {
        console.log("SQL Query 실행시 Error.")
        console.dir(err);
        return
      }
      if (rows.length > 0) {
        // 2. DB의 VOLUNTEERS 테이블에서 vID가 일치하는 회원의 accumCNT를 1 증가
        // 3. DB의 SERVICES 테이블에서 sNum이 일치하는 공고의 isFinish를 'Y'로 변경
        // 4. DB의 SERVICES 테이블에서 sNum이 일치하는 공고의 vID를 param_vID로 변경
        // 2., 3., 4.를 다중 query로 처리
        db = new sqlite3.Database('./OpenAPI_Project_DB/project.db');
        db.serialize(function () {
            db.run(`UPDATE VOLUNTEERS SET accumCNT = accumCNT + 1 WHERE vID = ?;`, [param_vID]);
            db.run(`UPDATE SERVICES SET isFinish = 'Y', vID = ? WHERE sNum = ?;`, [param_vID, param_sNum], function (err) {
                if (err) {
                    console.log("SQL Query 실행시 Error.")
                    console.dir(err);
                    res.send({ result: "failure" });
                } 
                else if (res) {
                    console.log("res : " + res);
                    console.log("volunteer accumCNT 증가, service 완료 처리 완료");
                    res.send({ result: "success" });
                }
            });
        });
    }
      else{
        console.log("vID가 존재하지 않습니다.");
        res.send({result:"No_vID"});
      }
    }
  );


  // close the database connection
  db.close();
});

// volunteer_main.html에서 보낸 노인복지회관에 대한 공고들을 return
app.get('/process/find_services', (req, res) => {
  console.log('/process/find_services 호출됨' +req)
  // 작성해야 함

});

app.listen(3000, () => {
  console.log('listening on port 3000')
})