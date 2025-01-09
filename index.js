import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { addDoc, collection, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB31LuOWt2kYXWF-M4GFBr2_STNWmtwMGU",
  authDomain: "meeting-c1e77.firebaseapp.com",
  projectId: "meeting-c1e77",
  storageBucket: "meeting-c1e77.appspot.com",
  messagingSenderId: "316077175994",
  appId: "1:316077175994:web:e4e88fa3ee354eeca87e83",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ฟังก์ชันสำหรับอัปเดตหัวข้อปฏิทิน
function updateCalendarHeader() {
  const calendarHeader = document.querySelector(".container h2");
  const now = new Date();

  // ชื่อเดือนภาษาไทย
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  // อัปเดตข้อความหัวข้อปฏิทิน
  calendarHeader.textContent = `ปฏิทินการจอง - ${monthName} ${year}`;
}

// ฟังก์ชันสร้างปฏิทิน
async function generateCalendar() {
  const calendar = document.getElementById("calendar");
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendar.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "bookings"));
  const bookings = {};
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (!bookings[data.date]) bookings[data.date] = [];
    bookings[data.date].push({ room: data.room, name: data.name, startTime: data.startTime, endTime: data.endTime });
  });

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const bookingInfo = bookings[dateStr]?.map(booking => `<div>${booking.name} (${booking.startTime}-${booking.endTime})</div>`).join("") || "ไม่มีการจอง";
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    if (bookings[dateStr]) dayElement.classList.add("booked");
    dayElement.innerHTML = `<div class="date">${day}</div><div>${bookingInfo}</div>`;
    calendar.appendChild(dayElement);
  }
}

async function loadBookings() {
  const bookingList = document.getElementById("bookingList");
  bookingList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "bookings"));

  // ดึงข้อมูลทั้งหมดจาก Firestore และเก็บในอาร์เรย์
  const bookings = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    bookings.push(data);
  });

  // เรียงลำดับข้อมูลตามวันที่ที่ใกล้ที่สุด
  bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

  // เพิ่มข้อมูลลงในตาราง
  bookings.forEach(data => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.room}</td>
      <td>${data.name}</td>
      <td>${data.date}</td>
      <td>${data.startTime}</td>
      <td>${data.endTime}</td>
    `;
    bookingList.appendChild(row);
  });

  // ถ้าไม่มีข้อมูล ให้แสดงข้อความว่างเปล่า
  if (bookings.length === 0) {
    bookingList.innerHTML = `
      <tr class="empty">
        <td colspan="5">ยังไม่มีการจอง</td>
      </tr>
    `;
  }
}


async function addBooking(room, name, date, startTime, endTime) {
  await addDoc(collection(db, "bookings"), { room, name, date, startTime, endTime });
  alert("เพิ่มการจองสำเร็จ!");
  await generateCalendar();
  await loadBookings();
}

async function checkDuplicateBooking(room, date, startTime, endTime) {
  const q = query(collection(db, "bookings"), where("room", "==", room), where("date", "==", date));
  const querySnapshot = await getDocs(q);
  let duplicate = false;
  querySnapshot.forEach(doc => {
    const booking = doc.data();
    if (startTime < booking.endTime && endTime > booking.startTime) {
      duplicate = true;
    }
  });
  return duplicate;
}

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const room = document.getElementById("room").value;
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (await checkDuplicateBooking(room, date, startTime, endTime)) {
    alert("ช่วงเวลานี้มีการจองอยู่แล้ว");
    return;
  }

  await addBooking(room, name, date, startTime, endTime);
});

window.onload = async () => {
  updateCalendarHeader(); // อัปเดตชื่อหัวข้อปฏิทิน
  await generateCalendar();
  await loadBookings();
};
