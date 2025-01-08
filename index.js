// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getFirestore, collection, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

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
async function fetchBookings() {
  const bookingList = document.getElementById('bookingList');
  bookingList.innerHTML = ''; // Clear current list

  try {
    // Real-time snapshot listener for Firestore
    const querySnapshot = await getDocs(collection(db, 'bookings'));

    if (querySnapshot.empty) {
      // If no bookings exist, display a message
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
  } catch (error) {
    console.error('Error fetching bookings: ', error);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
}

// Load bookings on page load
document.addEventListener('DOMContentLoaded', fetchBookings);
