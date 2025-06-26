// --- 定数 ---
const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];

// --- メインとなる関数 ---

/**
 * 「単日・連続」タブの生成ボタンが押されたときに実行される関数
 */
function generateDates() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    const startDate = parseFullDate(startDateInput.value);
    if (!startDate) {
        alert('開始日を「YYYY/MM/DD」の形式で正しく入力してください。');
        return;
    }

    if (endDateInput.value === '') {
        const result = formatAll(startDate);
        displayResults([result]);
    } else {
        const endDate = parseFullDate(endDateInput.value);
        if (!endDate) {
            alert('終了日を「YYYY/MM/DD」の形式で正しく入力してください。');
            return;
        }
        if (startDate > endDate) {
            alert('終了日は開始日以降の日付にしてください。');
            return;
        }

        const results = [];
        let currentDate = new Date(startDate); 
        while (currentDate <= endDate) {
            results.push(formatAll(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        displayResults(results);
    }
}

/**
 * 「曜日指定」タブの生成ボタンが押されたときに実行される関数
 */
function generateWeeklyDates() {
    // 1. 各入力欄から値を取得する
    const weekdaySelect = document.getElementById('weekly-weekday');
    const startDateInput = document.getElementById('weekly-start-date');
    const endDateInput = document.getElementById('weekly-end-date');

    const selectedWeekday = parseInt(weekdaySelect.value, 10);
    
    // 2. 開始日と終了日をパースし、エラーチェックを行う
    const startDate = parseFullDate(startDateInput.value);
    if (!startDate) {
        alert('開始日を「YYYY/MM/DD」の形式で正しく入力してください。');
        return;
    }
    const endDate = parseFullDate(endDateInput.value);
    if (!endDate) {
        alert('終了日を「YYYY/MM/DD」の形式で正しく入力してください。');
        return;
    }
    if (startDate > endDate) {
        alert('終了日は開始日以降の日付にしてください。');
        return;
    }

    // 3. ループで期間内の該当日付を検索
    const results = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // 現在の日付の曜日が、選択された曜日と一致するかチェック
        if (currentDate.getDay() === selectedWeekday) {
            // 一致したら結果の配列に追加
            results.push(formatAll(currentDate));
        }
        // 日付を1日進める
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 4. 結果を表示する
    displayResults(results);
}


// --- 日付処理の補助をする関数 ---

function parseFullDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        return date;
    }
    return null;
}

function formatAll(date) {
    const displayFormat = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAY_JP[date.getDay()]})`;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const yyyymmddFormat = `${y}${m}${d}`;
    return { display: displayFormat, yyyymmdd: yyyymmddFormat };
}


// --- 画面表示を更新する関数 ---
function displayResults(results) {
    const displayOutput = document.getElementById('display-output');
    const yyyymmddOutput = document.getElementById('yyyymmdd-output');
    const combinedText = document.getElementById('combined-text');
    
    displayOutput.innerHTML = '';
    yyyymmddOutput.innerHTML = '';
    
    if (results.length === 0) {
        combinedText.value = '';
        return;
    }
    const yyyymmddList = [];
    results.forEach(result => {
        const p1 = document.createElement('p');
        p1.textContent = result.display;
        displayOutput.appendChild(p1);
        
        const p2 = document.createElement('p');
        p2.textContent = result.yyyymmdd;
        yyyymmddOutput.appendChild(p2);
        
        yyyymmddList.push(result.yyyymmdd);
    });
    combinedText.value = yyyymmddList.join(',');
}


// --- UI操作のための関数 ---
function showTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabName}')"]`).classList.add('active');
}

function copyToClipboard() {
    const combinedText = document.getElementById('combined-text');
    if (combinedText.value === '') {
        alert('コピーするテキストがありません。');
        return;
    }
    navigator.clipboard.writeText(combinedText.value)
        .then(() => alert('クリップボードにコピーしました！'))
        .catch(err => {
            console.error('コピーに失敗しました', err);
            alert('コピーに失敗しました。');
        });
}

// --- 追記 ---

/**
 * すべての入力と出力をクリアする関数
 */
function clearAll() {
    // 入力欄をクリア
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('weekly-start-date').value = '';
    document.getElementById('weekly-end-date').value = '';
    
    // 結果表示エリアをクリア
    const emptyResults = [];
    displayResults(emptyResults);
}