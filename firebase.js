// Import Firebase SDK
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

// กำหนดค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB31LuOWt2kYXWF-M4GFBr2_STNWmtwMGU",
  authDomain: "meeting-c1e77.firebaseapp.com",
  databaseURL: "https://meeting-c1e77-default-rtdb.firebaseio.com", // ใช้ databaseURL จาก Firebase Console
  projectId: "meeting-c1e77",
  storageBucket: "meeting-c1e77.appspot.com",
  messagingSenderId: "316077175994",
  appId: "1:316077175994:web:e4e88fa3ee354eeca87e83"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// บันทึกการจองไปที่ Firebase Realtime Database
export function saveBookingToFirebase(room, name, time) {
  const bookingsRef = ref(database, 'bookings/'); // ชี้ไปยัง path `bookings` ใน Realtime Database
  push(bookingsRef, { room, name, time }); // บันทึกข้อมูลเป็น object
}

// โหลดข้อมูลการจองจาก Firebase
export function loadBookingsFromFirebase(bookingListElement) {
  const bookingsRef = ref(database, 'bookings/');

  // ดึงข้อมูลแบบเรียลไทม์
  onValue(bookingsRef, (snapshot) => {
    const bookings = snapshot.val();

    // ลบข้อมูลเดิมในตาราง
    bookingListElement.innerHTML = "";

    // เพิ่มข้อมูลใหม่ในตาราง
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

    // หากไม่มีข้อมูล แสดงข้อความ "ยังไม่มีการจอง"
    if (!snapshot.exists()) {
      bookingListElement.innerHTML = `
        <tr class="empty">
          <td colspan="3">ยังไม่มีการจอง</td>
        </tr>
      `;
    }
  });
}
