// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

// กำหนดค่า Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// บันทึกการจองไปที่ Firebase
export function saveBookingToFirebase(room, name, time) {
  const bookingsRef = ref(database, 'bookings/');
  push(bookingsRef, { room, name, time });
}

// โหลดข้อมูลการจองจาก Firebase
export function loadBookingsFromFirebase(bookingListElement) {
  const bookingsRef = ref(database, 'bookings/');
  onValue(bookingsRef, (snapshot) => {
    const bookings = snapshot.val();

    // ลบแถว "ยังไม่มีการจอง"
    const emptyRow = document.querySelector('.empty');
    if (emptyRow) {
      emptyRow.remove();
    }

    // เพิ่มข้อมูลในตาราง
    for (let key in bookings) {
      const { room, name, time } = bookings[key];
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${room}</td>
        <td>${name}</td>
        <td>${time}</td>
      `;
      bookingListElement.appendChild(newRow);
    }
  });
}
