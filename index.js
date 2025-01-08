// index.js

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB31LuOWt2kYXWF-M4GFBr2_STNWmtwMGU",
  authDomain: "meeting-c1e77.firebaseapp.com",
  projectId: "meeting-c1e77",
  storageBucket: "meeting-c1e77.appspot.com",
  messagingSenderId: "316077175994",
  appId: "1:316077175994:web:e4e88fa3ee354eeca87e83",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const bookingForm = document.getElementById("bookingForm");
const bookingList = document.getElementById("bookingList");
const calendar = document.getElementById("calendar");

const loadBookings = (callback) => {
  const bookingsRef = ref(database, 'bookings');
  onValue(bookingsRef, (snapshot) => {
    const data = snapshot.val();
    const bookings = data ? Object.values(data) : [];
    callback(bookings);
  });
};

const saveBooking = (newBooking) => {
  const bookingsRef = ref(database, 'bookings');
  push(bookingsRef, newBooking);
};

const renderTable = (bookings) => {
  const currentMonth = new Date().getMonth();
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate.getMonth() === currentMonth;
  });

  bookingList.innerHTML = "";

  if (filteredBookings.length === 0) {
    bookingList.innerHTML = `<tr class="empty"><td colspan="5">ยังไม่มีการจอง</td></tr>`;
    return;
  }

  filteredBookings.forEach((booking) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${booking.room}</td>
      <td>${booking.name}</td>
      <td>${booking.date}</td>
      <td>${booking.startTime}</td>
      <td>${booking.endTime}</td>
    `;
    bookingList.appendChild(row);
  });
};

const renderCalendar = (bookings) => {
  const currentMonth = new Date().getMonth();
  const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();

  calendar.innerHTML = "";

  for (let day = 1; day <= daysInMonth; day++) {
    const dayContainer = document.createElement("div");
    dayContainer.classList.add("calendar-day");
    const date = new Date(new Date().getFullYear(), currentMonth, day).toISOString().split("T")[0];

    const bookingsForDay = bookings.filter((booking) => booking.date === date);

    dayContainer.innerHTML = `
      <div class="date">${day}</div>
      ${bookingsForDay
        .map(
          (booking) => `<div class="booking-info">${booking.room} - ${booking.startTime} ถึง ${booking.endTime}</div>`
        )
        .join("")}
    `;

    calendar.appendChild(dayContainer);
  }
};

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const room = document.getElementById("room").value;
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (!room || !name || !date || !startTime || !endTime) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }

  const newBooking = { room, name, date, startTime, endTime };
  saveBooking(newBooking);

  bookingForm.reset();
  alert("การจองสำเร็จ!");
});

// Initial rendering
loadBookings((bookings) => {
  renderTable(bookings);
  renderCalendar(bookings);
});
