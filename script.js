let fpInstance = null;
let currentMode = 'range';
const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];

document.addEventListener('DOMContentLoaded', () => {
    initCalendar(currentMode);
});

function initCalendar(mode) {
    if (fpInstance) { fpInstance.destroy(); }

    const config = {
        locale: "ja",
        inline: true,
        dateFormat: "Y/m/d",
        mode: mode,
    };

    fpInstance = flatpickr("#calendar-container", config);
}

function changeMode(newMode) {
    if (currentMode === newMode) return;
    currentMode = newMode;

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode-${newMode}`).classList.add('active');
    
    initCalendar(newMode);
    clearResults();
}

function generateDates() {
    const selectedDates = fpInstance.selectedDates;
    if (selectedDates.length === 0) {
        alert('カレンダーから日付を選択してください。');
        return;
    }
    
    let results = [];
    
    switch (currentMode) {
        case 'range':
            if (selectedDates.length === 1) {
                results.push(formatAll(selectedDates[0]));
            } else {
                let [start, end] = selectedDates.sort((a,b) => a - b);
                let currentDate = new Date(start);
                while (currentDate <= end) {
                    results.push(formatAll(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            break;

        case 'multiple':
            results = selectedDates
                .sort((a,b) => a - b)
                .map(date => formatAll(date));
            break;
    }
    displayResults(results);
}

function formatAll(date) {
    const displayFormat = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAY_JP[date.getDay()]})`;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const yyyymmddFormat = `${y}${m}${d}`;
    return { display: displayFormat, yyyymmdd: yyyymmddFormat };
}

function displayResults(results) {
    clearResults();

    if (results.length === 0) {
        document.getElementById('display-output').innerHTML = '<p style="color: #6c757d;">条件に合う日付がありませんでした。</p>';
        return;
    }

    const displayOutput = document.getElementById('display-output');
    const yyyymmddOutput = document.getElementById('yyyymmdd-output');
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
    document.getElementById('combined-text').value = yyyymmddList.join(',');
}

function copyToClipboard(selector) {
    const element = document.querySelector(selector);
    if (!element || element.value === '') {
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

function copyOutput(elementId) {
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv || outputDiv.children.length === 0) {
        alert('コピーするテキストがありません。');
        return;
    }

    const textToCopy = Array.from(outputDiv.children)
                            .map(p => p.textContent)
                            .join('\n');
    
    if (textToCopy.trim() === '' || textToCopy.includes("条件に合う日付がありませんでした")) {
         alert('コピーするテキストがありません。');
         return;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => alert( (elementId === 'display-output' ? '日本語表記' : 'YYYYMMDD形式') + 'のリストをコピーしました！'))
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
    if (fpInstance) { fpInstance.clear(); }
    clearResults();
}