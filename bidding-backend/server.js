require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes'); 

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());

// --- CRITICAL FIX FOR LARGE BASE64 IMAGE UPLOADS ---
// Increases the body limit to 50MB. This prevents the server from failing 
// when receiving the large Base64 string from the profile picture upload,
// which previously caused the "JSON.parse" error.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// -----------------------------------------------------

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);

// Use Bid Routes
app.use('/api/auctions/:auctionId/bids', bidRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));