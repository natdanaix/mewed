// Import Firebase modules
import { Calendar } from 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/main.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

// Firebase configuration
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
const db = getFirestore(app);

// Function to fetch and display bookings
function fetchBookings() {
  const bookingList = document.getElementById('bookingList');
  bookingList.innerHTML = ''; // Clear current list

  onSnapshot(collection(db, 'bookings'), (querySnapshot) => {
    bookingList.innerHTML = ''; // Clear table each time snapshot updates

    if (querySnapshot.empty) {
      bookingList.innerHTML = `
        <tr class="empty">
          <td colspan="5">ยังไม่มีการจอง</td>
        </tr>
      `;
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const newRow = document.createElement('tr');

      newRow.innerHTML = `
        <td>${data.room}</td>
        <td>${data.name}</td>
        <td>${data.date}</td>
        <td>${data.startTime}</td>
        <td>${data.endTime}</td>
      `;

      bookingList.appendChild(newRow);
    });
  });
}

// Call fetchBookings when the page loads
document.addEventListener('DOMContentLoaded', fetchBookings);

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');

  // สร้างปฏิทิน
  const calendar = new Calendar(calendarEl, {
    initialView: 'dayGridMonth', // แสดงมุมมองแบบเดือน
    locale: 'th', // ตั้งค่าภาษาไทย
    headerToolbar: {
      left: 'prev,next today', // ปุ่มย้อนกลับ ถัดไป และวันนี้
      center: 'title', // ชื่อเดือน
      right: '' // ซ่อนปุ่มเปลี่ยนมุมมองอื่น
    },
    events: [] // จองกิจกรรม
  });

  calendar.render();

  // จัดการฟอร์มการจอง
  const bookingForm = document.getElementById('bookingForm');
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // รับค่าจากฟอร์ม
    const room = document.getElementById('room').value;
    const name = document.getElementById('name').value;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    if (!room || !name || !date || !startTime || !endTime) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const start = `${date}T${startTime}`;
    const end = `${date}T${endTime}`;

    // เพิ่มกิจกรรมลงในปฏิทิน
    calendar.addEvent({
      title: `${room} - ${name}`,
      start,
      end
    });

    alert('การจองสำเร็จ!');
    bookingForm.reset();
  });
});

