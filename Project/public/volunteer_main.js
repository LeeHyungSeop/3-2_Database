// Purpose: volunteer_main.html에 대한 javascript file
// axios를 이용해 open API 호출, data에 response.data를 저장
axios.get(url, { params: queryParams })
    .then(response => {
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        console.log('Body:', response.data);
        data = JSON.stringify(response.data, null, 2);
        // data를 array로 만들기
        data = Array.from(JSON.parse(data).data);
        // console.log(data)
    }).catch(error => {
            console.error('Error:', error);
    });

// 시/도 dropdown에서 선택된 값을 이용하여 시/군/구 dropdown에 option 추가 (dynamic select 구현)
function sigunguOptionChange() {
    // Get the selected value from sido dropdown
    selectedSido = sidoDropdown.options[sidoDropdown.selectedIndex].text;
    console.log("selectedSido's value : " + selectedSido);
    
    // selectedSido값과 일치하는 "시도" element만 추출
    const filteredData = data.filter(item => item.시도 === selectedSido);
    // 추출한 data에서 unique "시군구"값만 추출
    const uniqueSigungu = [...new Set(filteredData.map(item => item.시군구))];
    console.log("uniqueSigungu : " + uniqueSigungu);
    // uniqueSigungu값을 sigungu dropdown에 추가
    sigunguDropdown.innerHTML = '<option></option>';
    uniqueSigungu.forEach(item => {
        sigunguDropdown.innerHTML += `<option>${item}</option>`;
    });
}
// 시/군/구 dropdown에서 선택된 값을 이용하여 노인복지회관 dropdown에 option 추가 (dynamic select 구현)
function wcOptionChange() {
    // Get the selected value from sigungu dropdown
    selectedSigungu = sigunguDropdown.options[sigunguDropdown.selectedIndex].text;
    console.log("selectedSigungu's value : " + selectedSigungu);
    
    // selectedSigungu값과 일치하는 element만 추출
    const filteredData = data.filter(item => item.시도 === selectedSido && item.시군구 === selectedSigungu);
    
    // uniqueWc값을 wc dropdown에 추가
    filteredData.innerHTML = '<option></option>';
    filteredData.forEach(item => {
        wcDropdown.innerHTML += `<option>${item.기관명}</option>`;
    });
}

// 복지회관을 선택하면? -> 해당 복지회관에서 공고한 봉사 리스트 출력, 해당 복지회관까지 길 안내, 
wcDropdown.addEventListener('change', () => {
    selectedWc = wcDropdown.options[wcDropdown.selectedIndex].text;
    // 최종적으로 user가 선택한 sido, sigungu, wc 출력
    console.log("user가 선택한 시/도 : " + selectedSido);
    console.log("user가 선택한 시/군/구 : " + selectedSigungu);
    console.log("user가 선택한 노인복지회관 : " + selectedWc);
    
    // user가 선택한 복지회관을 기준으로 공고된 봉사 리스트 출력
    fetch('/process/search_service_from_db', {
        method: 'post',
        body: JSON.stringify({
            wcName : selectedWc
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => res.json())
    .then((res) => {
        // json type으로 parsing
        console.log("res.result : " + res.result)
        if(res.result == "failure"){
            console.log('data를 받아오지 못했습니다.')
            alert("존재하지 않는 노인복지회관입니다. 다시 입력해주세요.")
            return;
        }
        else if(res.result == "NoService"){
            console.log('data를 받아오지 못했습니다.')
            alert("해당 노인복지회관에 등록된 서비스가 없습니다.")
            return;
        }
        // 받아온 data=rows(res)를 갖고, "show_service_from_db"에 table로 출력해줌
        else if(res.result == "success"){
            console.log('data를 받아왔습니다.')
            // rows는 string type이므로 array type으로 변환
            const rows = JSON.parse(res.rows)
            console.log("rows : " + rows)

            // "show_table_columns" table에 규격에 맞게 받아온 rows를 출력
            var show_table_columns = document.getElementById('show_table_columns')
            // 받아온 rows를 table에 출력, 기존의 table 내용은 삭제, 각각의 row마다 "신청" button 삽입
            show_table_columns.innerHTML = "<tr><th>서비스고유번호</th><th>신청자 이름</th><th>신청자 전화번호</th><th>서비스 간략한 설명</th><th>할당 여부</th><th>처리 여부</th></tr>"
            for(let i = 0; i < rows.length; i++){
                show_table_columns.innerHTML += 
                    "<tr><td>" + rows[i].sNum + 
                    "</td><td>" + rows[i].vName + 
                    "</td><td>" + rows[i].vPhoneNum + 
                    "</td><td>" + rows[i].sDescribe + 
                    "</td><td>" + rows[i].isAssign + 
                    "</td><td>" + rows[i].isFinish + 
                    "</td></tr>"
            }
            // 각각의 row 바로 오른쪽에 "신청", "신청 취소" button 삽입
            for(let i = 0; i < rows.length; i++){
                show_table_columns.rows[i+1].innerHTML += "<td><button id='assign_btn" + i + "'>신청</button></td>"
                show_table_columns.rows[i+1].innerHTML += "<td><button id='cancel_btn" + i + "'>신청 취소</button></td>"
            }
            // "신청" button에 대한 'click' event listener
            for(let i = 0; i < rows.length; i++){
                const assign_btn = document.getElementById('assign_btn' + i)
                assign_btn.addEventListener('click', () => {
                    console.log("신청 button을 눌렀습니다.")
                    fetch('/process/assign_service_from_db', {
                        method: 'post',
                        body: JSON.stringify({
                            sNum: rows[i].sNum,
                            vID: vID
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then((res) => res.json())
                    .then((res) => {
                        // json type으로 parsing
                        console.log("res.result : " + res.result)
                        if(res.result == "failure"){
                            alert("신청에 실패했습니다. 다시 시도해주세요.")
                            return;
                        }
                        // 받아온 data=rows(res)를 갖고, "show_service_from_db"에 table로 출력해줌
                        else if(res.result == "success"){
                            alert("신청에 성공했습니다.")
                            // 신청된 row의 "할당 여부"를 "Y"로 변경
                            show_table_columns.rows[i+1].cells[4].innerHTML = "Y"
                            // show_assign_table에 신청한 공고들을 update
                            fetch('/process/show_assign_from_db', {
                                method: 'post',
                                body: JSON.stringify({
                                    vID: vID
                                }),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then((res) => res.json())
                            .then((res) => {
                                // json type으로 parsing
                                console.log("res.result : " + res.result)
                                if(res.result == "NoService"){
                                    console.log('data를 받아오지 못했습니다.')
                                    return;
                                }
                                // 받아온 data=rows(res)를 갖고, "show_assign_table"에 table로 출력해줌
                                else if(res.result == "success"){
                                    console.log('data를 받아왔습니다.')
                                    // rows는 string type이므로 array type으로 변환
                                    const rows = JSON.parse(res.rows)
                                    console.log("rows : " + rows)
                                
                                    // "show_assign_table" table에 규격에 맞게 받아온 rows를 출력
                                    var show_assign_table = document.getElementById('show_assign_table')
                                    // 받아온 rows를 table에 출력, 기존의 table 내용은 삭제
                                    show_assign_table.innerHTML = "<tr><th>서비스고유번호</th><th>신청자 이름</th><th>신청자 전화번호</th><th>서비스 간략한 설명</th><th>노인복지회관</th></tr>"
                                    for(let i = 0; i < rows.length; i++){
                                        show_assign_table.innerHTML += 
                                            "<tr><td>" + rows[i].sNum + 
                                            "</td><td>" + rows[i].vName + 
                                            "</td><td>" + rows[i].vPhoneNum + 
                                            "</td><td>" + rows[i].sDescribe + 
                                            "</td><td>" + rows[i].wcName + 
                                            "</td></tr>"
                                    }
                                }
                            })
                        }
                        else if(res.result=="already_assigned"){
                            alert("다른 회원님이 이미 신청한 공고입니다.")
                            return
                        }
                    })
                })
            }
            
            // "신청 취소" button에 대한 'click' event listener
            for(let i = 0; i < rows.length; i++){
                const cancel_btn = document.getElementById('cancel_btn' + i)
                cancel_btn.addEventListener('click', () => {
                    console.log("신청 취소 button을 눌렀습니다.")
                    fetch('/process/assign_cancel_from_db', {
                        method: 'post',
                        body: JSON.stringify({
                            sNum: rows[i].sNum,
                            vID: vID
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then((res) => res.json())
                    .then((res) => {
                        // json type으로 parsing
                        console.log("res.result : " + res.result)
                        if(res.result == "failure"){
                            console.log('data를 받아오지 못했습니다.')
                            alert("신청 취소에 실패했습니다. 다시 시도해주세요.")
                            return;
                        }
                        // 받아온 data=rows(res)를 갖고, "show_service_from_db"에 table로 출력해줌
                        else if(res.result == "success"){
                            console.log('data를 받아왔습니다.')
                            alert("신청 취소에 성공했습니다.")
                            // 신청 취소된 row의 "할당 여부"를 "N"로 변경
                            show_table_columns.rows[i+1].cells[4].innerHTML = "N"
                            // show_assign_table에 신청한 공고들을 update
                            fetch('/process/show_assign_from_db', {
                                method: 'post',
                                body: JSON.stringify({
                                    vID: vID
                                }),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then((res) => res.json())
                            .then((res) => {
                                // json type으로 parsing
                                console.log("res.result : " + res.result)
                                if(res.result == "NoService"){
                                    console.log('data를 받아오지 못했습니다.')
                                    return;
                                }
                                // 받아온 data=rows(res)를 갖고, "show_assign_table"에 table로 출력해줌
                                else if(res.result == "success"){
                                    console.log('data를 받아왔습니다.')
                                    // rows는 string type이므로 array type으로 변환
                                    const rows = JSON.parse(res.rows)
                                    console.log("rows : " + rows)
                                
                                    // "show_assign_table" table에 규격에 맞게 받아온 rows를 출력
                                    var show_assign_table = document.getElementById('show_assign_table')
                                    // 받아온 rows를 table에 출력, 기존의 table 내용은 삭제
                                    show_assign_table.innerHTML = "<tr><th>서비스고유번호</th><th>신청자 이름</th><th>신청자 전화번호</th><th>서비스 간략한 설명</th><th>노인복지회관</th></tr>"
                                    for(let i = 0; i < rows.length; i++){
                                        show_assign_table.innerHTML += 
                                            "<tr><td>" + rows[i].sNum + 
                                            "</td><td>" + rows[i].vName + 
                                            "</td><td>" + rows[i].vPhoneNum + 
                                            "</td><td>" + rows[i].sDescribe + 
                                            "</td><td>" + rows[i].wcName + 
                                            "</td></tr>"
                                    }
                                }
                            })
                            return
                        }
                        else if (res.result == "already_not_assigned"){
                            alert("아직 아무도 신청하지 않은 공고입니다.")
                            return;
                        }
                    })
                })
            }
        }
    })
});

// show_assign_table에 신청한 공고들을 출력
fetch('/process/show_assign_from_db', {
    method: 'post',
    body: JSON.stringify({
        vID: vID
    }),
    headers: {
        'Content-Type': 'application/json'
    }
}).then((res) => res.json())
.then((res) => {
    // json type으로 parsing
    console.log("res.result : " + res.result)
    if(res.result == "NoService"){
        console.log('data를 받아오지 못했습니다.')
        return;
    }
    // 받아온 data=rows(res)를 갖고, "show_assign_table"에 table로 출력해줌
    else if(res.result == "success"){
        console.log('data를 받아왔습니다.')
        // rows는 string type이므로 array type으로 변환
        const rows = JSON.parse(res.rows)
        console.log("rows : " + rows)

        // "show_assign_table" table에 규격에 맞게 받아온 rows를 출력
        var show_assign_table = document.getElementById('show_assign_table')
        // 받아온 rows를 table에 출력, 기존의 table 내용은 삭제
        show_assign_table.innerHTML = "<tr><th>서비스고유번호</th><th>신청자 이름</th><th>신청자 전화번호</th><th>서비스 간략한 설명</th><th>노인복지회관</th></tr>"
        for(let i = 0; i < rows.length; i++){
            show_assign_table.innerHTML += 
                "<tr><td>" + rows[i].sNum + 
                "</td><td>" + rows[i].vName + 
                "</td><td>" + rows[i].vPhoneNum + 
                "</td><td>" + rows[i].sDescribe + 
                "</td><td>" + rows[i].wcName + 
                "</td></tr>"
        }
    }
})
