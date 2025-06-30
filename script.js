// --- グローバル変数 (状態管理) ---
let fpInstance = null; // flatpickrのインスタンスを保持
let currentMode = 'range'; // 現在の選択モード ('range', 'weekly', 'multiple')
const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];


/**
 * ページの読み込み完了後に実行
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初期モードでカレンダーを初期化
    initCalendar(currentMode);
});

/**
 * カレンダーを初期化・再生成する関数
 * @param {string} mode - 'range', 'weekly', 'multiple'
 */
function initCalendar(mode) {
    // 既存のインスタンスがあれば破棄する
    if (fpInstance) {
        fpInstance.destroy();
    }

    const config = {
        locale: "ja",
        inline: true, // カレンダーを常に表示する
        dateFormat: "Y/m/d",
    };

    // モードに応じて設定を上書き
    if (mode === 'range' || mode === 'weekly') {
        config.mode = 'range';
    } else if (mode === 'multiple') {
        config.mode = 'multiple';
    }

    // カレンダーをコンテナに生成
    fpInstance = flatpickr("#calendar-container", config);
}

/**
 * モード切替ボタンが押されたときに実行
 * @param {string} newMode 
 */
function changeMode(newMode) {
    if (currentMode === newMode) return; // 同じモードなら何もしない
    currentMode = newMode;

    // ボタンのアクティブ状態を切り替え
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${newMode}`).classList.add('active');

    // 曜日指定オプションの表示/非表示
    const weeklyOptions = document.getElementById('weekly-options');
    weeklyOptions.style.display = newMode === 'weekly' ? 'flex' : 'none';
    
    // カレンダーを新しいモードで再生成
    initCalendar(newMode);

    // モードを切り替えたら結果をクリア
    clearResults();
}

/**
 * 「生成」ボタンが押されたときに実行
 */
function generateDates() {
    const selectedDates = fpInstance.selectedDates; // 選択された日付の配列を取得

    if (selectedDates.length === 0) {
        alert('カレンダーから日付を選択してください。');
        return;
    }
    
    let results = [];
    
    // 現在のモードに応じて処理を分岐
    switch (currentMode) {
        case 'range':
            if (selectedDates.length === 1) { // 日付が1つだけ選択されている場合
                results.push(formatAll(selectedDates[0]));
            } else { // 範囲選択されている場合
                let [start, end] = selectedDates.sort((a,b) => a - b);
                let currentDate = new Date(start);
                while (currentDate <= end) {
                    results.push(formatAll(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            break;
        
        case 'weekly':
            if (selectedDates.length < 2) {
                alert('期間の開始日と終了日を選択してください。');
                return;
            }
            const selectedWeekday = parseInt(document.getElementById('weekly-weekday').value, 10);
            let [start, end] = selectedDates.sort((a,b) => a - b);
            let currentDate = new Date(start);
            while (currentDate <= end) {
                if (currentDate.getDay() === selectedWeekday) {
                    results.push(formatAll(currentDate));
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            break;

        case 'multiple':
            results = selectedDates
                .sort((a,b) => a - b) // 日付順にソート
                .map(date => formatAll(date)); // 各日付をフォーマット
            break;
    }
    
    displayResults(results);
}


// --- 補助関数 ---

function formatAll(date) {
    const displayFormat = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAY_JP[date.getDay()]})`;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const yyyymmddFormat = `${y}${m}${d}`;
    return { display: displayFormat, yyyymmdd: yyyymmddFormat };
}

function displayResults(results) {
    const displayOutput = document.getElementById('display-output');
    const yyyymmddOutput = document.getElementById('yyyymmdd-output');
    const combinedText = document.getElementById('combined-text');

    clearResults(); // 表示前に一旦クリア

    if (results.length === 0) {
        displayOutput.innerHTML = '<p style="color: #6c757d;">条件に合う日付がありませんでした。</p>';
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

function clearResults() {
    document.getElementById('display-output').innerHTML = '';
    document.getElementById('yyyymmdd-output').innerHTML = '';
    document.getElementById('combined-text').value = '';
}

function clearAll() {
    fpInstance.clear(); // カレンダーの選択をクリア
    clearResults(); // 結果表示をクリア
}