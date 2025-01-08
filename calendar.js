import { getDocs, collection } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

export async function generateCalendar(db) {
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
    const date = data.date; // วันที่ของการจอง
    if (!bookings[date]) bookings[date] = [];
    bookings[date].push(data.name); // เก็บชื่อผู้จองในวันที่ตรงกัน
  });

  // สร้างวันในปฏิทิน
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");

    // ตรวจสอบว่ามีการจองในวันนี้หรือไม่
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
