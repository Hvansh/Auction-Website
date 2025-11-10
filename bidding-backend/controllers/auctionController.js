const Auction = require('../models/Auction.js');
const Bid = require('../models/Bid.js');

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Private
const createAuction = async (req, res) => {
    try {
        const { name, description, startingBid, endTime, imageUrl } = req.body;
        const auction = new Auction({
            name,
            description,
            startingBid,
            currentBid: startingBid,
            endTime,
            imageUrl,
            seller: req.user._id,
        });

        const createdAuction = await auction.save();
        res.status(201).json(createdAuction);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
const getAuctions = async (req, res) => {
    try {
        // We use populate to get the seller's name and email instead of just their ID
        const auctions = await Auction.find({}).populate('seller', 'name email');
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// @desc    Get a single auction by its ID and determine winner if it has ended
// @route   GET /api/auctions/:id
// @access  Public
const getAuctionById = async (req, res) => {
    try {
        let auction = await Auction.findById(req.params.id)
            .populate('seller', 'name')
            .populate('winner', 'name'); // Also populate winner details if they exist

        if (!auction) {
            res.status(404);
            throw new Error('Auction not found');
        }

        // --- WINNER DETERMINATION LOGIC ---
        // Check if the auction's end time has passed and if a winner has NOT been set yet
        if (new Date() > new Date(auction.endTime) && !auction.winner) {
            
            // Find the highest bid associated with this auction
            const winningBid = await Bid.findOne({ auction: auction._id })
                .sort({ amount: -1 }) // Sort by amount descending to get the highest bid
                .populate('bidder', 'name'); // Get the bidder's details

            if (winningBid) {
                // If a highest bid was found, set that bidder as the winner
                auction.winner = winningBid.bidder._id;
                auction.isActive = false; // Mark the auction as no longer active
                await auction.save();

                // Re-fetch the auction data to include the newly populated winner name
                auction = await Auction.findById(req.params.id)
                    .populate('seller', 'name')
                    .populate('winner', 'name');
            } else {
                // If no bids were placed, just mark the auction as inactive
                auction.isActive = false;
                await auction.save();
            }
        }

        res.json(auction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    createAuction,
    getAuctions,
    getAuctionById, // Export the new function so our routes can use it
};