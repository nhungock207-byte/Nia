// Dữ liệu mẫu ban đầu và các biến hằng số
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SESSIONS = ['Morning', 'Afternoon', 'Evening'];
const SESSION_LABELS = { 'Morning': 'Sáng', 'Afternoon': 'Chiều', 'Evening': 'Tối' };

let schedules = JSON.parse(localStorage.getItem('my_schedules')) || [];
let editMode = false;

// DOM Elements
const form = document.getElementById('schedule-form');
const timetableBody = document.getElementById('timetable-body');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const formTitle = document.getElementById('form-title');

// 1. Hàm Render Thời khóa biểu
function renderTimetable() {
    timetableBody.innerHTML = '';

    SESSIONS.forEach(session => {
        const row = document.createElement('tr');
        
        // Cột hiển thị buổi (Sáng/Chiều/Tối)
        const sessionCell = `<td class="session-label">${SESSION_LABELS[session]}</td>`;
        let daysCells = '';

        // Tạo các ô cho từng thứ
        DAYS.forEach(day => {
            const filtered = schedules.filter(s => s.day === day && s.session === session);
            // Sắp xếp theo giờ bắt đầu
            filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

            let itemsHtml = filtered.map(item => `
                <div class="schedule-item" onclick="editSchedule('${item.id}')">
                    <span class="time">${item.startTime} - ${item.endTime}</span>
                    <strong>${item.name}</strong>
                    ${item.note ? `<br><small>📝 ${item.note}</small>` : ''}
                </div>
            `).join('');

            daysCells += `<td data-day="${day}" data-session="${session}">${itemsHtml}</td>`;
        });

        row.innerHTML = sessionCell + daysCells;
        timetableBody.appendChild(row);
    });
}

// 2. Xử lý lưu (Thêm/Sửa)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('edit-id').value || Date.now().toString();
    const newSchedule = {
        id: id,
        name: document.getElementById('task-name').value,
        day: document.getElementById('day-of-week').value,
        session: document.getElementById('session').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        note: document.getElementById('note').value
    };

    if (editMode) {
        schedules = schedules.map(s => s.id === id ? newSchedule : s);
    } else {
        schedules.push(newSchedule);
    }

    saveAndRefresh();
    resetForm();
});

// 3. Hàm chuẩn bị sửa lịch trình
function editSchedule(id) {
    const item = schedules.find(s => s.id === id);
    if (!item) return;

    // Điền dữ liệu vào form
    document.getElementById('edit-id').value = item.id;
    document.getElementById('task-name').value = item.name;
    document.getElementById('day-of-week').value = item.day;
    document.getElementById('session').value = item.session;
    document.getElementById('start-time').value = item.startTime;
    document.getElementById('end-time').value = item.endTime;
    document.getElementById('note').value = item.note;

    // Đổi giao diện form sang mode Sửa
    editMode = true;
    formTitle.innerText = "✏️ Chỉnh Sửa Lịch Trình";
    btnSave.innerText = "Cập nhật & Lưu";
    btnSave.classList.add('btn-edit');
    btnCancel.style.display = "inline-block";

    // Thêm nút xóa nhanh khi đang sửa
    if (!document.getElementById('btn-delete')) {
        const btnDelete = document.createElement('button');
        btnDelete.id = 'btn-delete';
        btnDelete.type = 'button';
        btnDelete.className = 'btn';
        btnDelete.style.backgroundColor = '#ff4d6d';
        btnDelete.style.marginTop = '10px';
        btnDelete.innerText = '🗑️ Xóa lịch trình này';
        btnDelete.onclick = () => deleteSchedule(id);
        form.appendChild(btnDelete);
    }
    
    // Cuộn xuống form để người dùng thấy
    form.scrollIntoView({ behavior: 'smooth' });
}

// 4. Xóa lịch trình
function deleteSchedule(id) {
    if (confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
        schedules = schedules.filter(s => s.id !== id);
        saveAndRefresh();
        resetForm();
    }
}

// 5. Lưu vào LocalStorage và Render lại
function saveAndRefresh() {
    localStorage.setItem('my_schedules', JSON.stringify(schedules));
    renderTimetable();
}

// 6. Reset Form về trạng thái ban đầu
function resetForm() {
    form.reset();
    document.getElementById('edit-id').value = '';
    editMode = false;
    formTitle.innerText = "Thêm Lịch Trình Mới";
    btnSave.innerText = "➕ Thêm lịch trình";
    btnCancel.style.display = "none";
    const delBtn = document.getElementById('btn-delete');
    if (delBtn) delBtn.remove();
}

btnCancel.onclick = resetForm;

// Khởi tạo lần đầu
renderTimetable();