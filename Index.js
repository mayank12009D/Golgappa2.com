/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'the-golgappa-house-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many booking requests from this IP, please try again later.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' }
});

let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-golgappa-house';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    cachedDb = conn;
    console.log('MongoDB Connected: ' + conn.connection.host);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return null;
  }
}

connectDB();

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  whatsapp: { type: String, trim: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  eventAddress: { type: String, required: true },
  city: { type: String, required: true, default: 'Patna' },
  guestCount: { type: Number, required: true, min: 50 },
  packageName: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  flavours: { type: [String], default: [] },
  specialRequirements: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
}

const businessConfig = {
  name: "THE GOLGAPPA HOUSE",
  tagline: "Har Celebration Mein Chatpata Swad!",
  category: "Premium Golgappa & Pani Puri Catering Services",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "hello@thegolgappahouse.in",
  address: "Boring Road, Patna, Bihar, India",
  serviceArea: "Patna and nearby locations",
  workingHours: "10:00 AM – 10:00 PM",
  minBookingGuests: 50,
  instagram: "https://www.instagram.com/thegolgappahouse",
  menu: [
    { id: 1, name: "Classic Aloo Golgappa", desc: "Crispy hollow puris filled with spiced mashed potatoes, boiled chickpeas, and tangy tamarind chutney.", badge: "Bestseller", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80" },
    { id: 2, name: "Spicy Pani Puri", desc: "Traditional crispy puris served with fiery, mint-coriander spiced water and black salt kick.", badge: "Extra Spicy", image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Sweet Meetha Pani", desc: "Delightful tangy-sweet jaggery and tamarind infused water for a refreshing balanced bite.", badge: "Family Favorite", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80" },
    { id: 4, name: "Hing Jeera Pani", desc: "Aromatic digestive roasted cumin and asafoetida (hing) water that elevates street food to art.", badge: "Digestive Special", image: "https://images.unsplash.com/photo-1599487488170-ded1ec91a56f?auto=format&fit=crop&w=600&q=80" },
    { id: 5, name: "Dahi Golgappa", desc: "Crispy puris loaded with chilled sweet whipped curd, sev, pomegranate pearls, and sweet chutney.", badge: "Crowd Pleaser", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80" },
    { id: 6, name: "Special Masala Golgappa", desc: "Stuffed with grated paneer, boiled corn, tangy chaat masala, and special secret spice mix.", badge: "Chef Special", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80" },
    { id: 7, name: "Delhi Style Pani Puri", desc: "Punchy garlic-infused green chilli pani served with boiled potato chunks and raw mango bits.", badge: "Delhi Vibe", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80" },
    { id: 8, name: "Mumbai Style Pani Puri", desc: "Served with warm yellow vatana (peas) curry, sweet date chutney, and spicy green pani.", badge: "Mumbai Street", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80" }
  ],
  packages: [
    {
      id: "basic",
      name: "BASIC CHATPATA",
      price: 2999,
      guestLimit: 50,
      badge: "Starter",
      description: "Suitable for intimate family gatherings and small celebrations.",
      features: [
        "2 Golgappa flavours",
        "2 Pani options (Spicy & Sweet)",
        "Basic counter decoration",
        "1 professional serving staff member",
        "2-hour service duration"
      ]
    },
    {
      id: "premium",
      name: "PREMIUM CELEBRATION",
      price: 5999,
      guestLimit: 100,
      badge: "Most Popular",
      description: "Perfect for birthdays, anniversaries, and medium-sized parties.",
      features: [
        "4 Golgappa flavours",
        "4 Pani options",
        "Special masala and crunchy toppings",
        "Premium decorated counter setup",
        "2 professional serving staff members",
        "3-hour service duration"
      ]
    },
    {
      id: "royal",
      name: "ROYAL WEDDING",
      price: 11999,
      guestLimit: 200,
      badge: "VIP Experience",
      description: "Grand setup for weddings, receptions, and corporate galas.",
      features: [
        "6 Golgappa flavours",
        "5 Pani options including Hing Jeera & Garlic",
        "Grand royal decorated counter with lighting",
        "Fully customizable menu options",
        "4 expert uniformed serving staff members",
        "4-hour extended service",
        "Special royal presentation & counter branding"
      ]
    }
  ],
  categories: [
    { title: "Wedding Catering", desc: "Make your big day unforgettable with live street food counters.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" },
    { title: "Birthday Parties", desc: "Add chatpata fun to your kids and adult birthday bashes.", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80" },
    { title: "Engagement Ceremonies", desc: "Delight your guests with pristine hygiene and mouthwatering flavors.", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80" },
    { title: "Corporate Events", desc: "Impress clients and employees with live interactive food stations.", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80" },
    { title: "Family Functions", desc: "Reunions and get-togethers made extra special with authentic tastes.", image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80" },
    { title: "Festivals & Celebrations", desc: "Diwali, Holi, or Durga Puja - celebrate with authentic street flavors.", image: "https://images.unsplash.com/photo-1605648916361-9bc12ad6a56d?auto=format&fit=crop&w=600&q=80" }
  ],
  testimonials: [
    { name: "Aarav Sharma", event: "Wedding Reception", rating: 5, review: "The Golgappa House delivered beyond our expectations! The counter setup looked royal, and the hygiene standards were top-notch. Our guests are still talking about the Hing Jeera pani!", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Priya Singh", event: "Birthday Party", rating: 5, review: "Booked the Premium package for my daughter's 18th birthday. The live counter was a massive hit with youngsters and elders alike. Prompt service and super polite staff.", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Rajesh Kumar", event: "Corporate Annual Meet", rating: 5, review: "Professionalism at its best. On-time setup, wearing gloves and caps, crystal clear mineral water used for pani. Highly recommended for corporate events!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { name: "Sneha Sinha", event: "Engagement Ceremony", rating: 5, review: "Absolute perfection! The Dahi Golgappa and Sweet Meetha Pani were out of this world. Thank you Golgappa House for making our ceremony memorable.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
  ]
};

app.get('/api/config', (req, res) => {
  res.json(businessConfig);
});

app.post('/api/bookings', bookingLimiter, async (req, res) => {
  try {
    const {
      customerName, phone, email, whatsapp, eventType,
      eventDate, eventTime, eventAddress, city,
      guestCount, packageName, packagePrice, flavours,
      specialRequirements, additionalNotes
    } = req.body;

    if (!customerName || !phone || !email || !eventType || !eventDate || !eventTime || !eventAddress || !guestCount || !packageName) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    if (guestCount < 50) {
      return res.status(400).json({ error: 'Minimum booking requirement is 50 guests.' });
    }

    const eventDateObj = new Date(eventDate);
    if (eventDateObj < new Date(new Date().setHours(0,0,0,0))) {
      return res.status(400).json({ error: 'Event date cannot be in the past.' });
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingId = 'TGH-' + randomNum;

    const newBooking = new Booking({
      bookingId,
      customerName,
      phone,
      email,
      whatsapp: whatsapp || phone,
      eventType,
      eventDate: eventDateObj,
      eventTime,
      eventAddress,
      city: city || 'Patna',
      guestCount: Number(guestCount),
      packageName,
      packagePrice: Number(packagePrice) || 2999,
      flavours: flavours || [],
      specialRequirements: specialRequirements || '',
      additionalNotes: additionalNotes || '',
      status: 'Pending'
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully!',
      bookingId,
      booking: newBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Internal server error while saving booking.' });
  }
});

app.get('/api/booking/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId.toUpperCase() });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving booking.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    const contact = new Contact({ name, email, phone, message });
    await contact.save();
    res.json({ success: true, message: 'Message received successfully. We will contact you shortly!' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting contact message.' });
  }
});

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'golgappa2026';

    if (username === adminUser && password === adminPass) {
      req.session.isAdmin = true;
      return res.json({ success: true, message: 'Admin authenticated successfully.' });
    }

    let match = false;
    if (adminPass.startsWith('$2a$') || adminPass.startsWith('$2b$')) {
      match = await bcrypt.compare(password, adminPass);
    } else {
      match = (password === adminPass);
    }

    if (username === adminUser && match) {
      req.session.isAdmin = true;
      return res.json({ success: true, message: 'Admin authenticated successfully.' });
    }

    res.status(401).json({ error: 'Invalid admin credentials.' });
  } catch (error) {
    res.status(500).json({ error: 'Login error.' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Rejected' });
    
    const uniqueCustomers = await Booking.distinct('email');
    const totalRevenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$packagePrice' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalCustomers: uniqueCustomers.length,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats.' });
  }
});

app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const { search, status, eventType, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await Booking.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalBookings: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings.' });
  }
});

app.get('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching booking details.' });
  }
});

app.patch('/api/admin/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ success: true, message: 'Booking status updated to ' + status, booking });
  } catch (error) {
    res.status(500).json({ error: 'Error updating booking status.' });
  }
});

app.delete('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting booking.' });
  }
});

app.get('/api/admin/customers', requireAdmin, async (req, res) => {
  try {
    const customers = await Booking.aggregate([
      {
        $group: {
          _id: '$email',
          customerName: { $first: '$customerName' },
          phone: { $first: '$phone' },
          whatsapp: { $first: '$whatsapp' },
          city: { $first: '$city' },
          totalBookings: { $sum: 1 },
          lastBookingDate: { $max: '$createdAt' }
        }
      },
      { $sort: { lastBookingDate: -1 } }
    ]);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching customers.' });
  }
});

app.get('/admin', (req, res) => {
  const adminFilePath = path.join(__dirname, 'admin.js');
  if (fs.existsSync(adminFilePath)) {
    res.setHeader('Content-Type', 'text/html');
    res.send(fs.readFileSync(adminFilePath, 'utf8'));
  } else {
    res.status(404).send('Admin dashboard file (admin.js) not found.');
  }
});

app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessConfig.name} - ${businessConfig.tagline}</title>
  <meta name="description" content="${businessConfig.category} in Patna. Book live Golgappa & Pani Puri coun
