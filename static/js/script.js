let container = document.querySelector('.container .qst-container'),
    catValueInput = document.querySelector('.cat select'),
    difValueInput = document.querySelector('.dfc select'),
    nextBtn = document.querySelector('.next'),
    prevBtn = document.querySelector('.prev'),
    doneBtn = document.querySelector('.done'),
    timerCont = document.querySelector('.timer i'),
    resultContainer = document.querySelector('.result'),
    retryBtn = document.querySelector('.retry'),
    revBtn = document.querySelector('.review'),
    revWindow = document.querySelector('.rev-ans');
let crktAns = {},
    slkAns = {},
    qstList = {},
    qstNumber = 1,
    timer = 300,
    timeOut;

fetchData(catValueInput.value, difValueInput.value);
setTimer(difValueInput.value);
catValueInput.addEventListener('input', _ => {
    fetchData(catValueInput.value, difValueInput.value);
    setTimer(difValueInput.value);
});

difValueInput.addEventListener('input', _ => {
    fetchData(catValueInput.value, difValueInput.value);
    setTimer(difValueInput.value);
});

nextBtn.addEventListener('click', _ => {
    document.querySelector('.qst.active').classList.remove('active');
    document.getElementById(`${++qstNumber}`).classList.add('active');
    selectAns(document.getElementById(`${qstNumber}`));
    qstNumber == 10 ? doneBtn.classList.remove('inactive') : doneBtn.classList.add('inactive');
    if (qstNumber < 10 && qstNumber > 1) {
        prevBtn.classList.remove('inactive');
        return;
    }
    nextBtn.classList.add('inactive');
});

prevBtn.addEventListener('click', _ => {
    document.querySelector('.qst.active').classList.remove('active');
    document.getElementById(`${--qstNumber}`).classList.add('active');
    selectAns(document.getElementById(`${qstNumber}`));
    qstNumber == 10 ? doneBtn.classList.remove('inactive') : doneBtn.classList.add('inactive');

    if (qstNumber == 1) {
        prevBtn.classList.add('inactive');
        return;
    }
    nextBtn.classList.remove('inactive');
    prevBtn.classList.remove('inactive');
});

doneBtn.addEventListener('click', _ => {
    showResult(compareAns());
    clearInterval(timeOut);
});

retryBtn.addEventListener('click', _ => {
    resultContainer.classList.remove('active');
    fetchData(catValueInput.value, difValueInput.value);
    setTimer(difValueInput.value);
});

revBtn.addEventListener('click', addAnsToRev);

revWindow.querySelector('.cls-btn').addEventListener('click', _ => revWindow.classList.remove('active'));

function fetchData(catValue, difValue) {
    crktAns = {};
    qstList = {};
    qstNumber = 1;
    fetch(`https://opentdb.com/api.php?amount=10&category=${catValue}&difficulty=${difValue}`)
        .then(response => response.json())
        .then(data => displayQuestions(data.results));
    doneBtn.classList.contains('inactive') ? null : doneBtn.classList.add('inactive');
}

function displayQuestions(questions) {
    container.innerHTML = "";
    crktAns = {};
    qstList = {};
    questions.forEach(question => {
        let qstTxt = question.question,
            ansList = question.incorrect_answers;
        crktAns[`${qstNumber}`] = convertEncodedElemnetsToHTML(question.correct_answer);
        qstList[`${qstNumber}`] = qstTxt;
        slkAns[`${qstNumber}`] = '';
        ansList.push(question.correct_answer);
        ansList.sort();
        container.innerHTML += `<div class="qst" id="${qstNumber}">
                                    <p class="qst-num">${qstNumber}</p>
                                    <p class="qst_txt">${qstTxt}</p>
                                    <div class="ans">
                                    </div>
                                </div>`;
        let ansCont = document.getElementById(`${qstNumber}`).querySelector('.ans'),
            ltrs = ['A', 'B', 'C', 'D'],
            ansIndx = 0;
        ansList.forEach(ans => {
            ansCont.innerHTML += `<p><span>${ltrs[ansIndx]}</span><span class="ans-txt">${ans}</span></p>`;
            ansIndx++;
        });
        ansIndx = 0;
        ++qstNumber;
    });
    qstNumber = 1;
    document.getElementById(`${qstNumber}`).classList.add('active');
    console.log(crktAns);
    console.log(qstList);
    selectAns(document.getElementById(`${qstNumber}`));
    prevBtn.classList.contains('inactive') ? '' : prevBtn.classList.add('inactive');
    nextBtn.classList.contains('inactive') ? nextBtn.classList.remove('inactive') : '';
}

function selectAns(ansElement) {
    let ansList = ansElement.querySelectorAll('.ans p');
    ansList.forEach(ele => ele.addEventListener('click', _ => {
        ansElement.querySelector('p.selected')?.classList.remove('selected');
        ele.classList.add('selected');
        slkAns[ansElement.getAttribute('id')] = ele.querySelector('span.ans-txt').innerHTML;
    }));
}

function setTimer(difLevel) {
    clearInterval(timeOut);
    timer = difLevel == "easy" ? 150 : difLevel == "hard" ? 600 : 300;
    timeOut = setInterval(_ => {
        timerCont.innerText = getTime(--timer);
        timer == 0 ? doneBtn.click() : null;
    }, 1000);
}

function compareAns() {
    let count = 0;
    for (let i = 1; i <= 10; i++)
        slkAns[i] == crktAns[i] ? ++count : null;

    return `${(count * 10)}%`;
}

function showResult(res) {
    resultContainer.classList.add('active');
    resultContainer.querySelectorAll('.res span')[1].innerText = res;
}

function addAnsToRev() {
    let revQstWindow = revWindow.querySelector('.ans-cont');
    revWindow.classList.add('active')
    revQstWindow.innerHTML = '';
    console.log(slkAns);
    for (let i = 1; i <= 10; i++)
        if (slkAns[i] == crktAns[i]) {
            revQstWindow.innerHTML += `
            <div class="qst-rev">
                <span class="qst-rst crkt material-symbols-outlined">
                    check
                </span>
                <p class="qst-rev-txt"><span>${i}</span><span>${qstList[i]}</span></p>
                <p class="crkt-ans"><span class="material-symbols-outlined">
                        check
                    </span><span>${crktAns[i]}</span></p>
            </div>
        `} else {
            revQstWindow.innerHTML += `
            <div class="qst-rev">
                <span class="qst-rst rng material-symbols-outlined">
                    close
                </span>
                <p class="qst-rev-txt"><span>${i}</span><span>${qstList[i]}</span></p>
                <p class="crkt-ans"><span class="material-symbols-outlined">
                        check
                    </span><span>${crktAns[i]}</span></p>
                <p class="rng-ans"><span class="material-symbols-outlined">
                        close
                    </span><span>${slkAns[i]}</span></p>
            </div>
            `
        }
}

function convertEncodedElemnetsToHTML(encTxt) {
    let convertContainer = document.querySelector('.htmlConverter');
    convertContainer.innerHTML = `${encTxt}`
    return convertContainer.innerHTML;
}

function getTime(seconds) {
    let mins = Math.floor(seconds / 60);
    restSeconds = seconds % 60;
    return `${mins < 10 ? `0${mins}` : mins} : ${restSeconds < 10 ? `0${restSeconds}` : restSeconds}`;
}