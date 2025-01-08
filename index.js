// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, query, where } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

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
      addRowToTable(data);
    });
  }, (error) => {
    console.error('Error fetching bookings:', error.message);
    alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
  });
}

// Helper function to add a row to the booking table
function addRowToTable(data) {
  const bookingList = document.getElementById('bookingList');
  const newRow = document.createElement('tr');

  newRow.innerHTML = `
    <td>${data.room}</td>
    <td>${data.name}</td>
    <td>${data.date}</td>
    <td>${data.startTime}</td>
    <td>${data.endTime}</td>
  `;

  bookingList.appendChild(newRow);
}

// Validate if the new booking overlaps with existing bookings
async function isBookingOverlap(room, date, startTime, endTime) {
  const bookingsQuery = query(
    collection(db, 'bookings'),
    where('room', '==', room),
    where('date', '==', date)
  );

  const querySnapshot = await bookingsQuery.get();

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    if (
      (startTime >= data.startTime && startTime < data.endTime) || 
      (endTime > data.startTime && endTime <= data.endTime) ||
      (startTime <= data.startTime && endTime >= data.endTime)
    ) {
      return true; // Overlap detected
    }
  }

  return false;
}

// Handle form submission
document.getElementById('bookingForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Get form values
  const room = document.getElementById('room').value;
  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  // Validate input
  if (!room || !name || !date || !startTime || !endTime) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  // Check if start time is before end time
  if (startTime >= endTime) {
    alert('เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด');
    return;
  }

  // Check for booking overlap
  if (await isBookingOverlap(room, date, startTime, endTime)) {
    alert('ช่วงเวลาที่เลือกทับซ้อนกับการจองอื่น');
    return;
  }

  try {
    // Save booking to Firebase Firestore
    await addDoc(collection(db, 'bookings'), {
      room,
      name,
      date,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
    });

    alert('บันทึกการจองสำเร็จ!');
    this.reset(); // Reset form
  } catch (error) {
    console.error('Error adding document:', error.message);
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  }
});

// Call fetchBookings when the page loads
document.addEventListener('DOMContentLoaded', fetchBookings);
