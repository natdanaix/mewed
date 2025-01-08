// index.js

const bookingForm = document.getElementById("bookingForm");
const bookingList = document.getElementById("bookingList");
const calendar = document.getElementById("calendar");

// Store bookings in localStorage
const loadBookings = () => {
  return JSON.parse(localStorage.getItem("bookings")) || [];
};

const saveBookings = (bookings) => {
  localStorage.setItem("bookings", JSON.stringify(bookings));
};

const renderTable = () => {
  const bookings = loadBookings();
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

const renderCalendar = () => {
  const bookings = loadBookings();
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

  const bookings = loadBookings();
  bookings.push(newBooking);
  saveBookings(bookings);

  bookingForm.reset();
  renderTable();
  renderCalendar();

  alert("การจองสำเร็จ!");
});

// Initial rendering
renderTable();
renderCalendar();
