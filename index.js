// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

// กำหนดค่า Firebase Config
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

// บันทึกข้อมูลการจองไปยัง Firestore
export async function saveBookingToFirestore(room, name, date, time) {
  try {
    const bookingsRef = collection(db, "bookings");
    await addDoc(bookingsRef, { room, name, date, time });
    console.log("Booking added successfully!");
  } catch (error) {
    console.error("Error adding booking:", error);
  }
}

// โหลดข้อมูลการจองจาก Firestore
export function loadBookingsFromFirestore(bookingListElement) {
  const bookingsRef = collection(db, "bookings");

  onSnapshot(bookingsRef, (snapshot) => {
    // ล้างข้อมูลในตารางก่อน
    bookingListElement.innerHTML = "";

    if (snapshot.empty) {
      bookingListElement.innerHTML = `
        <tr class="empty">
          <td colspan="4">ยังไม่มีการจอง</td>
        </tr>
      `;
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Data retrieved:", data);
        const { room, name, date, time } = data;

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${room || "ไม่ระบุ"}</td>
          <td>${name || "ไม่ระบุ"}</td>
          <td>${date || "ไม่ระบุ"}</td>
          <td>${time || "ไม่ระบุ"}</td>
        `;
        bookingListElement.appendChild(newRow);
      });
    }
  });
}

// ฟังก์ชันการจัดการ DOM
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("bookingForm");
  const bookingList = document.getElementById("bookingList");

  // โหลดข้อมูลการจอง
  loadBookingsFromFirestore(bookingList);

  // จัดการการส่งฟอร์ม
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const room = document.getElementById("room").value;
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    console.log("Form Data:", { room, name, date, time });

    // บันทึกข้อมูลการจองไปยัง Firestore
    saveBookingToFirestore(room, name, date, time);

    // ล้างฟอร์มหลังการส่ง
    bookingForm.reset();
  });
});
