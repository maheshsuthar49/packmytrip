document.addEventListener('DOMContentLoaded', () => {
    const isAdminLoggedIn = localStorage.getItem('isAdmin');

    if (isAdminLoggedIn !== 'true') {
        window.location.href = '/admin.html';
        return;
    }

    fetchBookings();


    //  Fetch and display all bookings
    async function fetchBookings() {
        const bookingsContainer = document.getElementById('bookingsContainer');
        const response = await fetch('http://localhost:8000/admin/bookings');
        const bookings = await response.json();

        bookingsContainer.innerHTML = '';  // Clear container before adding bookings again

        bookings.forEach(booking => {
            const bookingElement = document.createElement('div');
            bookingElement.className = 'booking';
            bookingElement.innerHTML = `
            <h3>${booking.package_name}</h3>
            <p>Name: ${booking.name}</p>
                        <p>Email: ${booking.email}</p>
                        <p>Phone: ${booking.phone}</p>
                        <p>Guests: ${booking.guests}</p>
                        <p>Arrival: ${new Date(booking.arrival).toLocaleDateString()}</p>
                        <p>Leaving: ${new Date(booking.leaving).toLocaleDateString()}</p>
                        <p>Total Price: ₹${booking.total_price}</p>
                        <p>Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}</p>
                        <p>Booking Time: ${new Date(booking.createdAt).toLocaleTimeString()}</p>
            <p>Status: <strong id="status-${booking._id}" style="color: ${booking.status === 'Confirmed' ? 'green' : 'red'}">${booking.status}</strong></p>
            ${booking.status === 'Pending' ? `<button class="confirm-btn" data-id="${booking._id}">Confirm</button>` : ''}
        `;
            bookingsContainer.appendChild(bookingElement);
        });

        // ✅ Add event listener to confirm buttons
        document.querySelectorAll('.confirm-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const bookingId = event.target.getAttribute('data-id');
                await confirmBooking(bookingId);
            });
        });
    }

    // ✅ Function to confirm booking
    async function confirmBooking(id) {
        try {
            const response = await fetch(`http://localhost:8000/admin/confirm/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                alert('Booking confirmed!');
                document.getElementById(`status-${id}`).innerText = 'Confirmed';
                document.getElementById(`status-${id}`).style.color = 'green';
                document.querySelector(`[data-id="${id}"]`).remove();  // Remove confirm button after confirmation
            } else {
                alert('Error confirming booking: ' + data.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }
    // ✅ Function to logout admin
    window.logoutAdmin = function() {
        localStorage.removeItem('isAdmin');
        window.location.href = '/admin.html';
    };


    // ✅ Ensure `confirmBooking` is globally accessible
    window.confirmBooking = confirmBooking;
});