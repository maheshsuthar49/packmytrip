const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 8000;

// Use CORS middleware
app.use(cors());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(bodyParser.json());
app.use(session({ secret: 'adminSecret', resave: false, saveUninitialized: true }));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://maheshsuthardm:maheshjangidsuthar@cluster0.yvz0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB connected successfully to Atlas');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// MongoDB Schema for Booking Form
const BookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    guests: Number,
    arrival: Date,
    leaving: Date,
    package_name: String,
    total_price: Number,
    status: { type: String, default: 'Pending' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', BookingSchema);

// Predefined Admin Credentials
const ADMIN_CREDENTIALS = { email: 'admin@packmytrip.com', password: 'admin123' };

// Admin Login Route
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        req.session.admin = true;
        return res.json({ success: true, message: 'Login successful' });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Admin Logout Route
app.post('/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out' });
});

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

// Get all pending bookings for admin dashboard
app.get('/admin/bookings', requireAdmin, async (req, res) => {
    const bookings = await Booking.find({ status: 'Pending' });
    res.json(bookings);
});

// Confirm a booking
app.post('/admin/confirm/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Booking.findByIdAndUpdate(id, { status: 'Confirmed' }, { new: true });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ success: true, message: 'Booking confirmed', booking });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

// Fetch confirmed and pending bookings for history
app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
