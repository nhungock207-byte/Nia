// Cấu hình dữ liệu
const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const SESSIONS = { morning: "Sáng", afternoon: "Chiều", evening: "Tối" };

let schedules = JSON.parse(localStorage.getItem('mySchedules')) || [];
let editModeId = null;

// DOM Elements
const monthsContainer = document.getElementById('months-container');
const scheduleForm = document.getElementById('schedule-form');
const selectMonth = document.getElementById('select-month');

// 1. Khởi tạo dropdown tháng
function initForm() {
    MONTHS.forEach((m, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.textContent = m;
        selectMonth.appendChild(opt);
    });
}

// 2. Render Thời khóa biểu
function renderTimetable() {
    monthsContainer.innerHTML = '';

    MONTHS.forEach((monthName, mIndex) => {
        const monthTable = document.createElement('div');
        monthTable.className = 'month-table';
        
        let tableHTML = `<h3>${monthName} - 2026</h3>`;
        tableHTML += `<table><thead><tr><th>Tuần</th>`;
        DAYS.forEach(day => tableHTML += `<th>${day}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        for (let w = 1; w <= 4; w++) {
            tableHTML += `<tr><td>T${w}</td>`;
            for (let d = 0; d < 7; d++) {
                // Chuyển đổi 0-6 sang Thứ 2 -> CN (trong JS 0 là CN, ở đây ta theo UI: 2,3,4,5,6,7,0)
                const dayValue = d === 6 ? 0 : d + 2; 
                
                tableHTML += `<td>`;
                Object.keys(SESSIONS).forEach(sessionKey => {
                    tableHTML += `<div class="session-slot">
                        <span class="session-title">${SESSIONS[sessionKey]}</span>
                        <div id="slot-${mIndex}-${w}-${dayValue}-${sessionKey}"></div>
                    </div>`;
                });
                tableHTML += `</td>`;
            }
            tableHTML += `</tr>`;
        }
        
        tableHTML += `</tbody></table>`;
        monthTable.innerHTML = tableHTML;
        monthsContainer.appendChild(monthTable);
    });

    // Sau khi vẽ khung, đổ dữ liệu vào các ô
    fillSchedules();
}

// 3. Đổ dữ liệu lịch trình vào bảng
function fillSchedules() {
    schedules.forEach(item => {
        const slotId = `slot-${item.month}-${item.week}-${item.day}-${item.session}`;
        const container = document.getElementById(slotId);
        if (container) {
            const div = document.createElement('div');
            div.className = 'schedule-item';
            div.innerHTML = `<strong>${item.name}</strong><br><small>${item.time}</small>`;
            div.title = "Click để sửa hoặc xóa";
            div.onclick = () => loadForEdit(item.id);
            container.appendChild(div);
        }
    });
}

// 4. Xử lý Form (Thêm/Sửa)
scheduleForm.onsubmit = (e) => {
    e.preventDefault();
    
    const newSchedule = {
        id: editModeId || Date.now(),
        name: document.getElementById('task-name').value,
        month: parseInt(document.getElementById('select-month').value),
        week: document.getElementById('select-week').value,
        day: document.getElementById('select-day').value,
        session: document.getElementById('select-session').value,
        time: document.getElementById('task-time').value,
        note: document.getElementById('task-note').value
    };

    if (editModeId) {
        schedules = schedules.map(s => s.id === editModeId ? newSchedule : s);
        alert("Đã cập nhật lịch trình!");
    } else {
        schedules.push(newSchedule);
        alert("Đã thêm lịch trình mới!");
    }

    saveAndRefresh();
    resetForm();
};

// 5. Chỉnh sửa & Xóa
function loadForEdit(id) {
    const item = schedules.find(s => s.id === id);
    if (!item) return;

    editModeId = item.id;
    document.getElementById('task-name').value = item.name;
    document.getElementById('select-month').value = item.month;
    document.getElementById('select-week').value = item.week;
    document.getElementById('select-day').value = item.day;
    document.getElementById('select-session').value = item.session;
    document.getElementById('task-time').value = item.time;
    document.getElementById('task-note').value = item.note;

    document.getElementById('form-title').textContent = "✏️ Chỉnh sửa lịch trình";
    document.getElementById('btn-save').textContent = "Cập nhật thay đổi";
    
    // Hiện nút xóa/hủy
    document.getElementById('btn-cancel').style.display = "block";
    document.getElementById('btn-cancel').onclick = () => deleteSchedule(id);
    document.getElementById('btn-cancel').textContent = "🗑️ Xóa lịch trình này";
    
    // Cuộn xuống form
    document.getElementById('management-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteSchedule(id) {
    if (confirm("Bạn có chắc muốn xóa lịch trình này?")) {
        schedules = schedules.filter(s => s.id !== id);
        saveAndRefresh();
        resetForm();
    }
}

// 6. Tiện ích
function saveAndRefresh() {
    localStorage.setItem('mySchedules', JSON.stringify(schedules));
    renderTimetable();
}

function resetForm() {
    editModeId = null;
    scheduleForm.reset();
    document.getElementById('form-title').textContent = "Thêm Lịch Trình Mới";
    document.getElementById('btn-save').textContent = "➕ Lưu lịch trình";
    document.getElementById('btn-cancel').style.display = "none";
}

// Khởi chạy
initForm();
renderTimetable();