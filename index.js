// Import Firebase และ Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { addDoc, collection, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB31LuOWt2kYXWF-M4GFBr2_STNWmtwMGU",
  authDomain: "meeting-c1e77.firebaseapp.com",
  projectId: "meeting-c1e77",
  storageBucket: "meeting-c1e77.appspot.com",
  messagingSenderId: "316077175994",
  appId: "1:316077175994:web:e4e88fa3ee354eeca87e83",
};

// Initialize Firebase และ Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ฟังก์ชันช่วย: สร้าง HTML สำหรับปฏิทิน
function createDayElement(day, bookingInfo) {
  const dayElement = document.createElement("div");
  dayElement.classList.add("calendar-day");

  dayElement.innerHTML = `
    <div class="date">${day}</div>
    <div class="booking-info">${bookingInfo}</div>
  `;

  return dayElement;
}
const currentMonthDisplay = document.getElementById("currentMonth");
const calendarGrid = document.getElementById("calendar");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar(month, year) {
  // อัปเดตชื่อเดือน
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
  
  // ล้างข้อมูลเก่าของปฏิทิน
  calendarGrid.innerHTML = "";

  // โค้ดสร้างวันที่ในเดือนนี้ (คุณสามารถเพิ่มโค้ดนี้เอง)
}
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

// เริ่มต้นแสดงปฏิทินเดือนปัจจุบัน
renderCalendar(currentMonth, currentYear);
// ฟังก์ชันสร้างปฏิทิน
async function generateCalendar() {
  const calendar = document.getElementById("calendar");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = ""; // ล้างข้อมูลเดิมในปฏิทิน

  try {
    // ดึงข้อมูลการจองทั้งหมดจาก Firestore
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date;
      if (!bookings[date]) bookings[date] = [];
      bookings[date].push(data.name);
    });

    // สร้างวันในปฏิทิน
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const bookingInfo = bookings[dateStr]
        ? bookings[dateStr].map((name) => `<div>${name}</div>`).join("")
        : "<div>ไม่มีการจอง</div>";

      const dayElement = createDayElement(day, bookingInfo);
      calendar.appendChild(dayElement);
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างปฏิทิน: ", error);
    alert("ไม่สามารถโหลดปฏิทินได้ โปรดลองอีกครั้ง");
  }
}

// ฟังก์ชันโหลดรายการจองในตาราง
async function loadBookings() {
  const bookingTableBody = document.getElementById("bookingList");
  bookingTableBody.innerHTML = ""; // ล้างข้อมูลเดิมในตาราง

  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));

    if (querySnapshot.empty) {
      const emptyRow = document.createElement("tr");
      emptyRow.classList.add("empty");
      emptyRow.innerHTML = `<td colspan="5">ยังไม่มีการจอง</td>`;
      bookingTableBody.appendChild(emptyRow);
      return;
    }

    querySnapshot.forEach((doc) => {
      const booking = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${booking.room}</td>
        <td>${booking.name}</td>
        <td>${booking.date}</td>
        <td>${booking.startTime}</td>
        <td>${booking.endTime}</td>
      `;

      bookingTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดรายการจอง: ", error);
    alert("ไม่สามารถโหลดข้อมูลการจองได้ โปรดลองอีกครั้ง");
  }
}

// ฟังก์ชันจัดการการส่งฟอร์ม
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const room = document.getElementById("room").value;
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  try {
    // ตรวจสอบการจองซ้ำ
    const isDuplicate = await checkDuplicateBooking(room, date, startTime, endTime);

    if (isDuplicate) {
      alert("ห้องประชุมในช่วงเวลานี้ถูกจองไว้แล้ว กรุณาเลือกช่วงเวลาอื่น");
    } else {
      // เพิ่มข้อมูลการจองใหม่
      await addDoc(collection(db, "bookings"), {
        room,
        name,
        date,
        startTime,
        endTime,
      });

      alert("จองสำเร็จ!");
      await loadBookings(); // โหลดรายการจองใหม่
      await generateCalendar(); // อัปเดตปฏิทิน
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการจอง: ", error);
    alert("ไม่สามารถจองได้ โปรดลองอีกครั้ง");
  }
});

// ฟังก์ชันตรวจสอบการจองซ้ำ
async function checkDuplicateBooking(room, date, startTime, endTime) {
  const bookingQuery = query(
    collection(db, "bookings"),
    where("room", "==", room),
    where("date", "==", date)
  );

  try {
    const querySnapshot = await getDocs(bookingQuery);
    let isDuplicate = false;

    querySnapshot.forEach((doc) => {
      const booking = doc.data();
      const existingStartTime = booking.startTime;
      const existingEndTime = booking.endTime;

      if (startTime < existingEndTime && endTime > existingStartTime) {
        isDuplicate = true;
      }
    });

    return isDuplicate;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการตรวจสอบการจองซ้ำ: ", error);
    return false;
  }
}

// โหลดปฏิทินและรายการจองเมื่อโหลดหน้า
window.onload = async () => {
  await loadBookings();
  await generateCalendar();
};
