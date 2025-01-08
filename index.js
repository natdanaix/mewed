// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

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

// Handle form submission
document.getElementById('bookingForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Get form values
  const room = document.getElementById('room').value;
  const name = document.getElementById('name').value;
  const time = document.getElementById('time').value;
  const date = document.getElementById('date').value;

  // Validate input
  if (!room || !name || !time || !date) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  try {
    // Save booking to Firebase
    const docRef = await addDoc(collection(db, 'bookings'), {
      room,
      name,
      time,
      date,
      createdAt: new Date().toISOString(),
    });

    console.log('Document written with ID: ', docRef.id);
    alert('บันทึกการจองสำเร็จ!');

    // Add new booking to the table
    const bookingList = document.getElementById('bookingList');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
      <td>${room}</td>
      <td>${name}</td>
      <td>${date} ${time}</td>
    `;

    // Remove "ยังไม่มีการจอง" row if exists
    const emptyRow = bookingList.querySelector('.empty');
    if (emptyRow) {
      emptyRow.remove();
    }

    bookingList.appendChild(newRow);

    // Reset form
    this.reset();
  } catch (error) {
    console.error('Error adding document: ', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
});
