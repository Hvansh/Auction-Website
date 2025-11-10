const express = require('express');
const router = express.Router();
const {
    createAuction,
    getAuctions,
    getAuctionById, // Import the new function
} = require('../controllers/auctionController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Public route to get all auctions
// URL: GET /api/auctions
router.route('/').get(getAuctions);

// Private route to create a new auction
// URL: POST /api/auctions
router.route('/').post(protect, createAuction);

// Public route to get a single auction's details (and check for a winner)
// URL: GET /api/auctions/:id
router.route('/:id').get(getAuctionById);


module.exports = router;
