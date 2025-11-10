const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

/**
 * @desc    Place a new bid on an auction
 * @route   POST /api/bids/:auctionId/bids
 * @access  Private
 */
const placeBid = async (req, res) => {
    const { amount } = req.body;
    const { auctionId } = req.params;

    try {
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            res.status(404);
            throw new Error('Auction not found');
        }
 
        // Check if auction has ended
        if (new Date() > new Date(auction.endTime)) {
            res.status(400);
            throw new Error('Auction has ended');
        }
        
        // Check if bid is high enough
        if (amount <= auction.currentBid) {
            res.status(400);
            throw new Error('Bid must be higher than the current bid');
        }

        if (auction.seller.toString() === req.user.id) {
            res.status(400);
            throw new Error('You cannot bid on your own auction');
        }

        // Create the new bid
        const bid = new Bid({
            auction: auctionId,
            bidder: req.user._id,
            amount,
        });

        await bid.save();

        // Update the auction with the new current bid
        auction.currentBid = amount;
        auction.winner = req.user._id; // Tentative winner
        await auction.save();

        res.status(201).json({ message: 'Bid placed successfully', bid });

    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

/**
 * @desc    Get all bids for a specific auction (Leaderboard data)
 * @route   GET /api/bids/:auctionId/bids
 * @access  Public
 */
const getAuctionBids = async (req, res) => {
    try {
        const { auctionId } = req.params;

        // Find all bids for the auction, sort them by amount descending, and populate the bidder details
        const bids = await Bid.find({ auction: auctionId })
            .sort({ amount: -1, createdAt: 1 }) // Highest bid first, then oldest bid for tie-breaking
            .populate({
                path: 'bidder',
                select: 'name profilePicture' // Only fetch the name and the new profilePicture field
            });
        
        if (bids.length === 0) {
            return res.json([]);
        }

        // We only need to return the top 5 unique bidders for the leaderboard
        // Filter for unique bidders (since one person might bid multiple times)
        const uniqueBidders = [];
        const bidderIds = new Set();

        for (const bid of bids) {
            const bidderId = bid.bidder._id.toString();
            if (!bidderIds.has(bidderId)) {
                bidderIds.add(bidderId);
                uniqueBidders.push(bid);

                // Stop after collecting the top 5 unique bids
                if (uniqueBidders.length >= 5) {
                    break;
                }
            }
        }

        res.json(uniqueBidders);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching auction bids', error: error.message });
    }
};

module.exports = {
    placeBid,
    // NEW FUNCTION EXPORT
    getAuctionBids,
};