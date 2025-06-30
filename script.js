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
    const weekdaySelect = document.getElementById('weekly-weekday');
    const startDateInput = document.getElementById('weekly-start-date');
    const endDateInput = document.getElementById('weekly-end-date');
    const selectedWeekday = parseInt(weekdaySelect.value, 10);

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

    const results = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        if (currentDate.getDay() === selectedWeekday) {
            results.push(formatAll(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    displayResults(results);
}


// ▼▼▼ 変更点(1/3): 「複数選択」タブ用の生成関数を新規作成 ▼▼▼
/**
 * 「複数選択」タブの生成ボタンが押されたときに実行される関数
 */
function generateMultipleDates() {
    const datesInput = document.getElementById('multiple-dates');
    const selectedDatesStr = datesInput.value;

    if (!selectedDatesStr) {
        alert('カレンダーから日付を選択してください。');
        return;
    }

    // flatpickrが返す日付文字列は "YYYY/MM/DD, YYYY/MM/DD, ..." の形式
    const dateStrings = selectedDatesStr.split(', ');
    const results = [];

    for (const dateStr of dateStrings) {
        const date = parseFullDate(dateStr.trim());
        if (date) {
            // formatAll関数で整形して結果配列に追加
            results.push(formatAll(date));
        }
    }

    // 結果を日付順にソートする（ユーザーが順不同で選択した場合のため）
    results.sort((a, b) => a.yyyymmdd.localeCompare(b.yyyymmdd));

    // 整形した結果を表示
    displayResults(results);
}
// ▲▲▲ 変更点(1/3) ▲▲▲


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
        // 結果が空の場合はテキストエリアも空にする
        displayOutput.innerHTML = '<p style="color: #6c757d;">条件に合う日付がありませんでした。</p>';
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
    
    // タブを切り替えたら結果もクリアする
    clearAll();
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

/**
 * すべての入力と出力をクリアする関数
 */
function clearAll() {
    // 入力欄をクリア
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('weekly-start-date').value = '';
    document.getElementById('weekly-end-date').value = '';
    // ▼▼▼ 変更点(2/3): 新しい入力欄のクリア処理を追加 ▼▼▼
    document.getElementById('multiple-dates').value = '';
    // ▲▲▲ 変更点(2/3) ▲▲▲

    // 結果表示エリアをクリア
    const emptyResults = [];
    displayResults(emptyResults);
    // 初期状態に戻すためにメッセージもクリア
    document.getElementById('display-output').innerHTML = '';
}


// --- カレンダー機能の有効化 ---

/**
 * ページの読み込みが完了したあとに実行される処理
 */
document.addEventListener('DOMContentLoaded', () => {
    const flatpickrConfig = {
        "locale": "ja",
        dateFormat: "Y/m/d",
    };

    flatpickr("#start-date", flatpickrConfig);
    flatpickr("#end-date", flatpickrConfig);
    flatpickr("#weekly-start-date", flatpickrConfig);
    flatpickr("#weekly-end-date", flatpickrConfig);

    // ▼▼▼ 変更点(3/3): 複数選択用のカレンダーを初期化 ▼▼▼
    flatpickr("#multiple-dates", {
        "locale": "ja",
        dateFormat: "Y/m/d",
        mode: "multiple", // 複数選択モードを有効に
        conjunction: ", ", // 日付の区切り文字を設定
    });
    // ▲▲▲ 変更点(3/3) ▲▲▲
});