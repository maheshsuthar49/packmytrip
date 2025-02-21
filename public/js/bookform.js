// Add the showToast function
function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `
        <span>${message}</span>
        <span class="close-btn">&times;</span>
    `;
    toastContainer.appendChild(toast);

    toast.querySelector('.close-btn').onclick = function() {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    };

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// Booking form submission
document.getElementById('bookingForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        userId: localStorage.getItem('userId'),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        guests: document.getElementById('guests').value,
        arrival: document.getElementById('arrival').value,
        leaving: document.getElementById('leaving').value,
        package_name: document.getElementById('package').value,
        total_price: document.getElementById('total_price').value
    };

    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.status === 'success') {
            showToast('Booking successful! We will contact you soon.');
            document.getElementById('bookingForm').reset();
            
        } else {
            showToast('Booking failed: ' + data.message);
        }
    } catch (error) {
        showToast('Error: ' + error.message);
    }
});