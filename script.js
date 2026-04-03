let students = JSON.parse(localStorage.getItem("eagle_vision_db")) || [];
let currentFilter = 'all';

// نظام الدخول
function login() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if(user === "admin" && pass === "123") {
        document.getElementById("loginScreen").classList.add("hidden");
        document.getElementById("mainDashboard").classList.remove("hidden");
        document.getElementById("welcomeMsg").innerHTML = `<i class="fas fa-user-circle"></i> المشرف: ${user}`;
        render();
    } else {
        Swal.fire('خطأ!', 'بيانات الدخول غير صحيحة', 'error');
    }
}

function logout() {
    location.reload(); // إعادة تحميل الصفحة للخروج
}

// إضافة طالب
function addStudent() {
    const name = document.getElementById("studentName").value.trim();
    const amt = parseFloat(document.getElementById("amount").value) || 0;

    if(!name) return Swal.fire('تنبيه', 'ادخل الاسم أولاً', 'info');

    students.unshift({
        id: Date.now(),
        name: name,
        amount: amt,
        isPaid: amt > 0, // لو دخل مبلغ يعتبر دفع
        date: new Date().toLocaleDateString('ar-EG')
    });

    document.getElementById("studentName").value = "";
    document.getElementById("amount").value = "";
    save();
}

// تصفية البيانات (Filter)
function filterData(type, btn) {
    currentFilter = type;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    render();
}

function togglePaid(id) {
    const s = students.find(x => x.id === id);
    if(s) {
        s.isPaid = !s.isPaid;
        save();
    }
}

function deleteStudent(id) {
    Swal.fire({
        title: 'حذف السجل؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        confirmButtonText: 'نعم، احذف'
    }).then(res => { if(res.isConfirmed) { students = students.filter(x => x.id !== id); save(); } });
}

function save() {
    localStorage.setItem("eagle_vision_db", JSON.stringify(students));
    render();
}

function render() {
    const list = document.getElementById("studentList");
    const search = document.getElementById("searchInput").value.toLowerCase();
    list.innerHTML = "";

    let totalMoney = 0;
    
    const filtered = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search);
        const matchesTab = currentFilter === 'all' || 
                          (currentFilter === 'paid' && s.isPaid) || 
                          (currentFilter === 'unpaid' && !s.isPaid);
        return matchesSearch && matchesTab;
    });

    filtered.forEach(s => {
        if(s.isPaid) totalMoney += s.amount;
        
        const li = document.createElement("li");
        li.className = s.isPaid ? "paid-row" : "";
        li.innerHTML = `
            <div>
                <strong>${s.name}</strong> 
                <span class="status-badge ${s.isPaid ? 'paid-badge' : 'unpaid-badge'}">
                    ${s.isPaid ? 'مدفوع' : 'غير مدفوع'}
                </span><br>
                <small style="color:#8892b0">${s.date}</small>
            </div>
            <div style="display:flex; align-items:center; gap:12px">
                <span style="font-weight:bold; color:var(--gold)">${s.amount} ج.م</span>
                <input type="checkbox" class="no-print" ${s.isPaid ? 'checked' : ''} onchange="togglePaid(${s.id})">
                <button class="no-print" onclick="deleteStudent(${s.id})" style="background:none; color:var(--danger)"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(li);
    });

    document.getElementById("totalMoney").innerText = totalMoney.toLocaleString();
    document.getElementById("studentCount").innerText = filtered.length;
}

async function downloadPDF() {
    const element = document.getElementById("printArea");
    const canvas = await html2canvas(element, { backgroundColor: "#0a192f", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Eagle_Finance_Report.pdf");
}