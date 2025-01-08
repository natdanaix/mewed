// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getFirestore, collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

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

  // Real-time listener for Firestore
  onSnapshot(collection(db, 'bookings'), (querySnapshot) => {
    bookingList.innerHTML = ''; // Clear table each time snapshot updates

    if (querySnapshot.empty) {
      bookingList.innerHTML = `
        <tr class="empty">
          <td colspan="3">ยังไม่มีการจอง</td>
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
        <td>${data.date} ${data.time}</td>
      `;

      bookingList.appendChild(newRow);
    });
  });
}

// Call fetchBookings when the page loads
document.addEventListener('DOMContentLoaded', fetchBookings);

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
    // Save booking to Firebase Firestore
    await addDoc(collection(db, 'bookings'), {
      room,
      name,
      time,
      date,
      createdAt: new Date().toISOString(),
    });

    alert('บันทึกการจองสำเร็จ!');
    this.reset(); // Reset form
  } catch (error) {
    console.error('Error adding document: ', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  }
});
