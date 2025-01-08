// Import Firebase และ Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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

// ชื่อเดือน
const monthNames = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// ฟังก์ชันช่วย: สร้าง HTML สำหรับปฏิทิน
function createDayElement(day, bookingInfo, hasBooking) {
  const dayElement = document.createElement("div");
  dayElement.classList.add("calendar-day");

  if (hasBooking) {
    dayElement.style.backgroundColor = "#d1e7dd"; // พื้นหลังสีเขียวอ่อนเมื่อมีการจอง
  } else {
    dayElement.style.backgroundColor = "#f8f9fa"; // พื้นหลังสีเทาอ่อนเมื่อไม่มีการจอง
  }

  dayElement.innerHTML = `
    <div class="date">${day}</div>
    <div class="booking-info">${bookingInfo}</div>
  `;

  return dayElement;
}

// ฟังก์ชันสร้างปฏิทิน
async function generateCalendar() {
  const calendarContainer = document.getElementById("calendar-container");
  const calendar = document.getElementById("calendar");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = ""; // ล้างข้อมูลเดิมในปฏิทิน

  // แสดงชื่อเดือน
  calendarContainer.querySelector(".month-name").textContent = `${monthNames[month]} ${year}`;

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
      const hasBooking = Boolean(bookings[dateStr]);
      const bookingInfo = hasBooking
        ? bookings[dateStr].map((name) => `<div>${name}</div>`).join("")
        : "<div>ไม่มีการจอง</div>";

      const dayElement = createDayElement(day, bookingInfo, hasBooking);
      calendar.appendChild(dayElement);
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างปฏิทิน: ", error);
    alert("ไม่สามารถโหลดปฏิทินได้ โปรดลองอีกครั้ง");
  }
}

// โหลดปฏิทินและรายการจองเมื่อโหลดหน้า
window.onload = async () => {
  await generateCalendar();
  await loadBookings();
};

// ฟังก์ชันโหลดรายการจองในตาราง (เหมือนเดิม)
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
