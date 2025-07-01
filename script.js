let fpInstance = null;
let currentMode = 'range';
const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    initCalendar(currentMode);
});

// --- カレンダーの初期化・再描画 ---
function initCalendar(mode) {
    if (fpInstance) {
        fpInstance.destroy();
    }

    const config = {
        locale: "ja",
        inline: true,
        dateFormat: "Y/m/d",
        mode: mode,
    };

    fpInstance = flatpickr("#calendar-container", config);
}

// --- モード切替 ---
function changeMode(newMode) {
    if (currentMode === newMode) return;
    currentMode = newMode;

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${newMode}`).classList.add('active');
    
    initCalendar(newMode);
    clearResults();
}

// --- 日付生成のメイン処理 ---
function generateDates() {
    const selectedDates = fpInstance.selectedDates;
    if (selectedDates.length === 0) {
        alert('カレンダーから日付を選択してください。');
        return;
    }
    
    // 選択された日付を昇順にソート
    const sortedDates = selectedDates.sort((a, b) => a - b);
    let results = [];
    
    // 「単日・連続」モードで期間が選択された場合
    if (currentMode === 'range' && sortedDates.length > 1) {
        // 期間内のすべての日付を生成
        let [start, end] = [sortedDates[0], sortedDates[sortedDates.length - 1]];
        let currentDate = new Date(start);
        while (currentDate <= end) {
            results.push(formatDate(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else {
        // 「複数選択」モード、または「単日・連続」で1日だけ選択した場合
        results = sortedDates.map(date => formatDate(date));
    }
    
    displayResults(results);
}

// --- 日付を目的の形式に変換 ---
function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = WEEKDAY_JP[date.getDay()];
    
    const display = `${year}年${month}月${day}日（${weekday}）`;
    const displayShort = `${month}月${day}日（${weekday}）`;
    const displayDayOnly = `${day}日（${weekday}）`;

    const yyyymmdd = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
    
    return { display, displayShort, displayDayOnly, yyyymmdd };
}

// --- 結果の表示 ---
function displayResults(results) {
    clearResults();
    const displayOutput = document.getElementById('display-output');

    if (results.length === 0) {
        displayOutput.innerHTML = '<p style="color: #6c757d;">条件に合う日付がありませんでした。</p>';
        return;
    }

    // ★★★ 年表示のロジックをここに実装 ★★★
    if (currentMode === 'range' && results.length > 1) {
        const start = results[0];
        const end = results[results.length - 1];
        const p = document.createElement('p');

        const startYear = start.yyyymmdd.substring(0, 4);
        const endYear = end.yyyymmdd.substring(0, 4);

        if (startYear === endYear) {
            // 年が同じ場合
            const startMonth = start.yyyymmdd.substring(4, 6);
            const endMonth = end.yyyymmdd.substring(4, 6);
            if (startMonth === endMonth) {
                // 月も同じ場合 -> 2025年7月1日（火）～12日（土）
                p.textContent = `${start.display}～${end.displayDayOnly}`;
            } else {
                // 月が違う場合 -> 2025年7月28日（月）～8月5日（火）
                p.textContent = `${start.display}～${end.displayShort}`;
            }
        } else {
            // 年が違う場合 -> 2025年12月28日（日）～2026年1月5日（月）
            p.textContent = `${start.display}～${end.display}`;
        }
        displayOutput.appendChild(p);
    } else {
        // 単日または複数選択の場合
        results.forEach(result => {
            const p = document.createElement('p');
            p.textContent = result.display;
            displayOutput.appendChild(p);
        });
    }

    // YYYYMMDDの連結テキストを生成
    const yyyymmddList = results.map(r => r.yyyymmdd);
    document.getElementById('combined-text').value = yyyymmddList.join(',');
}

// --- 結果のクリア ---
function clearResults() {
    document.getElementById('display-output').innerHTML = '';
    document.getElementById('combined-text').value = '';
}

// --- すべてクリア ---
function clearAll() {
    if (fpInstance) {
        fpInstance.clear();
    }
    clearResults();
}

// --- コピー機能 ---
function copyToClipboard(selector) {
    const element = document.querySelector(selector);
    if (!element || !element.value) {
        alert('コピーするテキストがありません。');
        return;
    }
    navigator.clipboard.writeText(element.value)
        .then(() => alert('クリップボードにコピーしました！'))
        .catch(err => {
            console.error('コピーに失敗しました', err);
            alert('コピーに失敗しました。');
        });
}

function copyOutput() {
    const outputDiv = document.getElementById('display-output');
    if (!outputDiv || outputDiv.children.length === 0 || outputDiv.children[0].textContent.includes('条件に合う日付がありませんでした')) {
        alert('コピーするテキストがありません。');
        return;
    }

    const textToCopy = Array.from(outputDiv.children)
                             .map(p => p.textContent)
                             .join('\n');
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert('日本語表記のリストをコピーしました！'))
        .catch(err => {
            console.error('コピーに失敗しました', err);
            alert('コピーに失敗しました。');
        });
}