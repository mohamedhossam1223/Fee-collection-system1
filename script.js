// حركة الماوس (للكمبيوتر فقط)
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
    if(cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

let students = JSON.parse(localStorage.getItem("eagle_data")) || [];
let currentFilter = 'all';

function login() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;
    if(user === "admin" && pass === "123") {
        document.getElementById("loginScreen").classList.add("hidden");
        document.getElementById("mainDashboard").classList.remove("hidden");
        document.getElementById("welcomeMsg").innerText = "أهلاً، " + user;
        render();
    } else {
        Swal.fire('خطأ', 'البيانات غير صحيحة', 'error');
    }
}

function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    const amt = parseFloat(document.getElementById("amount").value) || 0;
    if(!name) return;

    students.unshift({
        id: Date.now(),
        name: name,
        amount: amt,
        isPaid: amt > 0,
        date: new Date().toLocaleDateString('ar-EG')
    });
    document.getElementById("studentName").value = "";
    document.getElementById("amount").value = "";
    save();
}

function filterData(type, btn) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
}

function togglePaid(id) {
    const s = students.find(x => x.id === id);
    if(s) { s.isPaid = !s.isPaid; save(); }
}

function save() {
    localStorage.setItem("eagle_data", JSON.stringify(students));
    render();
}

function render() {
    const list = document.getElementById("studentList");
    const search = document.getElementById("searchInput").value.toLowerCase();
    list.innerHTML = "";

    let total = 0;
    const filtered = students.filter(s => {
        const mSearch = s.name.toLowerCase().includes(search);
        const mTab = currentFilter === 'all' || 
                     (currentFilter === 'paid' && s.isPaid) || 
                     (currentFilter === 'unpaid' && !s.isPaid);
        return mSearch && mTab;
    });

    filtered.forEach(s => {
        if(s.isPaid) total += s.amount;
        const li = document.createElement("li");
        li.className = s.isPaid ? "paid-row" : "";
        li.innerHTML = `
            <div>
                <strong>${s.name}</strong><br>
                <small>${s.date}</small>
            </div>
            <div style="display:flex; align-items:center; gap:10px">
                <b>${s.amount}</b>
                <input type="checkbox" ${s.isPaid ? 'checked' : ''} onchange="togglePaid(${s.id})">
            </div>
        `;
        list.appendChild(li);
    });
    document.getElementById("totalMoney").innerText = total;
    document.getElementById("studentCount").innerText = filtered.length;
}

async function downloadPDF() {
    const element = document.getElementById("printArea");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save("Eagle_Report.pdf");
}