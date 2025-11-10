const express = require('express');
const router = express.Router({ mergeParams: true });
// UPDATED: Import the new controller function
const { placeBid, getAuctionBids } = require('../controllers/bidController'); 
const { protect } = require('../middleware/authMiddleware');

// URL: POST /api/auctions/:auctionId/bids
router.post('/', protect, placeBid);

// NEW ROUTE: GET /api/auctions/:auctionId/bids
// This fetches the bid history for the leaderboard
router.get('/', getAuctionBids);

module.exports = router;