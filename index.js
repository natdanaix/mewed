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

// ฟังก์ชันสร้างปฏิทิน
async function generateCalendar() {
  const calendar = document.getElementById("calendar");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ล้างข้อมูลในปฏิทินก่อนสร้างใหม่
  calendar.innerHTML = "";

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
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");

    const bookingInfo = bookings[dateStr]
      ? bookings[dateStr].map((name) => `<div>${name}</div>`).join("")
      : "<div>ไม่มีการจอง</div>";

    dayElement.innerHTML = `
      <div class="date">${day}</div>
      <div class="booking-info">${bookingInfo}</div>
    `;

    calendar.appendChild(dayElement);
  }
}

// ฟังก์ชันโหลดรายการจองในตาราง
async function loadBookings() {
  const bookingTableBody = document.getElementById("bookingList");
  bookingTableBody.innerHTML = "";

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
}

// ฟังก์ชันจัดการการส่งฟอร์ม
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // ดึงค่าจากฟอร์ม
  const room = document.getElementById("room").value;
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  // ตรวจสอบการจองซ้ำ
  const isDuplicate = await checkDuplicateBooking(room, date, startTime, endTime);

  if (isDuplicate) {
    alert("ห้องประชุมในช่วงเวลานี้ถูกจองไว้แล้ว กรุณาเลือกช่วงเวลาอื่น");
  } else {
    try {
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
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: ", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ โปรดลองอีกครั้ง");
    }
  }
});

// ฟังก์ชันตรวจสอบการจองซ้ำ
async function checkDuplicateBooking(room, date, startTime, endTime) {
  const bookingQuery = query(
    collection(db, "bookings"),
    where("room", "==", room),
    where("date", "==", date)
  );

  const querySnapshot = await getDocs(bookingQuery);
  let isDuplicate = false;

  querySnapshot.forEach((doc) => {
    const booking = doc.data();
    const existingStartTime = booking.startTime;
    const existingEndTime = booking.endTime;

    // ตรวจสอบว่ามีช่วงเวลาทับซ้อนกันหรือไม่
    if (startTime < existingEndTime && endTime > existingStartTime) {
      isDuplicate = true;
    }
  });

  return isDuplicate;
}

// โหลดปฏิทินและรายการจองเมื่อโหลดหน้า
window.onload = async () => {
  await loadBookings();
  await generateCalendar();
};
