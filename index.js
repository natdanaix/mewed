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

document.getElementById('bookingForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const room = document.getElementById('room').value;
  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  // อัปเดตตารางรายการจอง
  const bookingList = document.getElementById('bookingList');
  const emptyRow = bookingList.querySelector('.empty');
  if (emptyRow) emptyRow.remove();

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${room}</td>
    <td>${name}</td>
    <td>${date}</td>
    <td>${startTime}</td>
    <td>${endTime}</td>
  `;
  bookingList.appendChild(newRow);

  // อัปเดตปฏิทิน
  const calendarDay = document.querySelector(`.calendar-day[data-date="${date}"]`);
  if (calendarDay) {
    const bookingInfoContainer = calendarDay.querySelector('.booking-info-container');
    const bookingInfo = document.createElement('div');
    bookingInfo.className = 'booking-info';
    bookingInfo.textContent = `${name} (${startTime} - ${endTime})`;
    bookingInfoContainer.appendChild(bookingInfo);
  } else {
    alert('ไม่พบวันที่ในปฏิทิน');
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
