// --- Backend API Configuration ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- Fallback Image ---
const FALLBACK_IMAGE_URL = 'https://images.luxgive.com/558/live-auction-fundraising-event.jpg';

let allAuctionItems = [];

// --- DOM Elements ---
const auctionGrid = document.getElementById('auctionGrid');
const auctionModal = document.getElementById('auctionModal');
const authModal = document.getElementById('authModal');
const modalCloseBtn = auctionModal.querySelector('.close');
const authModalCloseBtn = authModal.querySelector('.auth-close');
const modalBody = document.getElementById('modalBody');
const searchInput = document.querySelector('.search-bar input[type="text"]');
const searchButton = document.querySelector('.search-bar button');
const userSection = document.getElementById('user-section');
const createAuctionForm = document.getElementById('create-auction-form');

// --- Helper Functions ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// Helper to check if a string is a Base64 data URL
const isBase64Data = (str) => str && str.startsWith('data:');

// Helper to create a Base64 data URL if needed
const getImageUrl = (urlOrBase64) => {
    // If it's already a data URL or a standard external URL, return it
    if (urlOrBase64 && (urlOrBase64.startsWith('http') || urlOrBase64.startsWith('data:'))) {
        return urlOrBase4;
    }
    // If it's a raw Base64 string, prepend the necessary prefix
    if (urlOrBase64) {
        return `data:image/png;base64,${urlOrBase64}`;
    }
    // Otherwise, return the fallback
    return FALLBACK_IMAGE_URL;
};

// --- Auction Logic (Fetching, Rendering, Bidding) ---
async function fetchAndRenderAuctions() {
    try {
        const response = await fetch(`${API_BASE_URL}/auctions`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allAuctionItems = await response.json();
        renderAuctionItems(allAuctionItems);
    } catch (error) {
        console.error('Failed to fetch auctions:', error);
        auctionGrid.innerHTML = '<p class="error-message">Could not load auction items. Is the backend server running?</p>';
    }
}

const renderAuctionItems = (itemsToRender) => {
    auctionGrid.innerHTML = '';
    document.querySelector('.featured-auctions h2').textContent = itemsToRender.length === 0 ? "No Results Found" : "Featured Auctions";

    if (itemsToRender.length === 0) {
        auctionGrid.innerHTML = '<p class="no-items-message">Please try a different search term or category.</p>';
        return;
    }

    itemsToRender.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('auction-card');
        card.dataset.itemId = item._id;
        card.dataset.endTime = new Date(item.endTime).getTime();
        
        // Use the new getImageUrl helper for the auction item image (Card View)
        const itemImageUrl = getImageUrl(item.imageUrl || FALLBACK_IMAGE_URL);

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${itemImageUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_URL}';">
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <p class="current-bid">Current Bid: <strong>${formatCurrency(item.currentBid)}</strong></p>
                <div class="countdown">Loading...</div>
                <button class="btn-bid">View Details</button>
            </div>`;
        auctionGrid.appendChild(card);
    });
    updateCountdown();
};

async function placeBid(auctionId, bidAmount) {
    const token = localStorage.getItem('authToken');
    const bidMessage = document.querySelector('.bid-message');
    if (!token) {
        bidMessage.textContent = 'You must be logged in to place a bid.';
        bidMessage.style.color = '#dc3545';
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: bidAmount })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'An error occurred.');
        bidMessage.textContent = 'Success! Your bid has been placed.';
        bidMessage.style.color = '#28a745';
        
        // Refresh the leaderboard and auction details on success
        await fetchAndRenderLeaderboard(auctionId, data.bid.amount);

        // Update the current bid display in the modal
        document.querySelector('.highest-bid').textContent = formatCurrency(data.bid.amount);

        // Update the input min value
        const minBid = data.bid.amount + 1;
        const bidInput = document.getElementById('bidAmount');
        if (bidInput) {
            bidInput.min = minBid;
            bidInput.placeholder = minBid;
            bidInput.value = ''; // Clear input after successful bid
        }

    } catch (error) {
        bidMessage.textContent = error.message;
        bidMessage.style.color = '#dc3545';
    }
}

// --- Create Auction Logic ---
async function handleCreateAuction(e) {
    e.preventDefault();
    const messageEl = document.getElementById('create-auction-message');
    const token = localStorage.getItem('authToken');

    if (!token) {
        messageEl.textContent = 'You must be logged in to create an auction.';
        messageEl.style.color = '#dc3545';
        openModal('auth');
        return;
    }

    const formData = new FormData(createAuctionForm);
    const auctionData = Object.fromEntries(formData.entries());
    auctionData.startingBid = parseFloat(auctionData.startingBid);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auctions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(auctionData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create auction.');
        
        messageEl.textContent = 'Auction created successfully!';
        messageEl.style.color = '#28a745';
        createAuctionForm.reset();
        fetchAndRenderAuctions();
        document.getElementById('auctions').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.style.color = '#dc3545';
    }
}

// --- Auth Logic (Login, Register, UI Update) ---
function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

function updateLoginState() {
    const user = getUserData();
    
    if (user) {
        // Use the getImageUrl helper for the profile picture
        const avatarSrc = getImageUrl(user.profilePicture);

        userSection.innerHTML = `
            <div class="dropdown">
                <img src="${avatarSrc}" alt="${user.name} Avatar" class="profile-avatar">
                <button class="user-button">Hello, ${user.name.split(' ')[0]}</button>
                <div class="dropdown-content">
                    <a href="#">My Bids</a>
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>`;
    } else {
        userSection.innerHTML = `<button class="user-button" id="login-register-btn"><i class="fas fa-user"></i> Login</button>`;
    }
}

async function handleAuthForm(e, formType) {
    e.preventDefault();
    const isLogin = formType === 'login';
    const email = document.getElementById(`${formType}-email`).value;
    const password = document.getElementById(`${formType}-password`).value;
    const messageEl = document.getElementById(`${formType}-message`);
    let endpoint = isLogin ? '/users/login' : '/users';
    let body = { email, password };
    
    if (!isLogin) {
        body.name = document.getElementById('register-name').value;
        
        // Handle file upload and conversion to Base64
        const fileInput = document.getElementById('register-profile-file');
        const file = fileInput.files[0];

        if (file) {
            try {
                const base64String = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]); // Keep only the Base64 part
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
                body.profilePicture = base64String;
            } catch (error) {
                console.error("File reading failed:", error);
                messageEl.textContent = 'Error reading profile picture file.';
                messageEl.style.color = '#dc3545';
                return;
            }
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();

        // Ensure we handle non-200 responses that returned JSON (like 400s)
        if (!response.ok) {
            // Check if the response includes a meaningful message
            throw new Error(data.message || `Server error: ${response.status}`);
        }
        
        // Success case
        localStorage.setItem('authToken', data.token);
        // Store user object (including profilePicture)
        localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            profilePicture: data.profilePicture 
        }));

        messageEl.textContent = isLogin ? 'Login successful!' : 'Registration successful!';
        messageEl.style.color = '#28a745';
        setTimeout(() => {
            closeModal('auth');
            updateLoginState();
        }, 1000);

    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.style.color = '#dc3545';
    }
}

// --- Leaderboard Logic ---
async function fetchAndRenderLeaderboard(auctionId, currentHighestBid) {
    const leaderboardEl = document.getElementById('bidLeaderboard');
    if (!leaderboardEl) return; 

    try {
        // Use a standard fetch, token not required for public bid data
        const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bids`);
        if (!response.ok) throw new Error('Could not fetch leaderboard data.');
        const uniqueBids = await response.json(); // Array of top unique bids

        leaderboardEl.innerHTML = ''; // Clear previous content

        if (uniqueBids.length === 0) {
            leaderboardEl.innerHTML = '<p class="text-center">No bids placed yet.</p>';
            return;
        }

        const listHtml = uniqueBids.map((bid, index) => {
            // Determine if this bid is the current highest bid
            // We use >= to handle ties if the highest bid is also the first bid.
            const isHighest = bid.amount >= currentHighestBid;
            const entryClass = isHighest ? 'bid-entry highest-bid-entry' : 'bid-entry';
            
            // Use the getImageUrl helper for the bidder avatar
            const avatarSrc = getImageUrl(bid.bidder.profilePicture);

            return `
                <div class="${entryClass}">
                    <div class="bidder-info">
                        <img src="${avatarSrc}" alt="${bid.bidder.name}" class="bidder-avatar">
                        <span>${bid.bidder.name}</span>
                    </div>
                    <div class="bid-amount">
                        ${isHighest ? '<i class="fas fa-crown" style="color:#ffc107;"></i>' : ''}
                        ${formatCurrency(bid.amount)}
                    </div>
                </div>
            `;
        }).join('');

        leaderboardEl.innerHTML = listHtml;

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        leaderboardEl.innerHTML = '<p class="text-center" style="color:red;">Error loading leaderboard.</p>';
    }
}


// --- Modal and Countdown Logic ---
const openModal = async (type, itemId = null) => {
    if (type === 'auth') {
        authModal.style.display = 'block';
    } else if (type === 'auction' && itemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/auctions/${itemId}`);
            if (!response.ok) throw new Error('Could not fetch auction details.');
            const item = await response.json();
            
            let biddingContent = '';
            
            // 1. Get current logged-in user ID
            const currentUser = getUserData();
            const currentUserId = currentUser ? currentUser._id : null;
            const isSeller = currentUserId && item.seller && currentUserId === item.seller._id;
            
            // 2. Check if auction is ended
            if (new Date() > new Date(item.endTime)) {
                if (item.winner && item.winner.name) {
                    biddingContent = `
                        <div class="winner-announcement">
                            <h3><i class="fas fa-trophy"></i> Auction Ended</h3>
                            <p>Winner: <strong>${item.winner.name}</strong></p>
                            <p>Winning Bid: <strong>${formatCurrency(item.currentBid)}</strong></p>
                        </div>`;
                } else {
                    biddingContent = `<div class="winner-announcement"><p>This auction has ended with no bids.</p></div>`;
                }
            } else if (isSeller) { // 3. Check if current user is the seller
                 biddingContent = `
                    <div class="winner-announcement" style="background-color:#fff3cd; border:1px solid #ffe090; padding:15px; border-radius:8px;">
                        <h4 style="color:#856404;"><i class="fas fa-ban"></i> Seller Action Required</h4>
                        <p style="color:#856404;">You cannot bid on your own item. Manage your listing.</p>
                    </div>`;
            } else {
                const minBid = item.currentBid + 1;
                biddingContent = `
                    <div class="bidding-form">
                        <label for="bidAmount">Your Bid (Min ${formatCurrency(minBid)}):</label>
                        <input type="number" id="bidAmount" min="${minBid}" placeholder="${minBid}">
                        <button class="btn-place-bid" data-auction-id="${item._id}"><i class="fas fa-gavel"></i> Place Bid</button>
                    </div>
                    <p class="bid-message"></p>`;
            }

            // --- FIX APPLIED HERE ---
            // Use the getImageUrl helper for the modal item image
            const modalImageUrl = getImageUrl(item.imageUrl || FALLBACK_IMAGE_URL);

            modalBody.innerHTML = `
                <div class="modal-body-wrapper">
                    <div class="modal-item-details">
                        <img src="${modalImageUrl}" alt="${item.name}" class="modal-image" onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_URL}';">
                        <h2>${item.name}</h2>
                        <p class="modal-description">${item.description}</p>
                        <div class="bid-status-box">
                            <p>Current Bid: <span class="highest-bid">${formatCurrency(item.currentBid)}</span></p>
                            <p>Seller: <strong>${item.seller.name}</strong></p>
                        </div>
                        <hr>
                        ${biddingContent}
                    </div>
                    <div class="bid-leaderboard-container">
                        <h3>Live Bid Leaderboard</h3>
                        <div id="bidLeaderboard">
                            <p class="text-center">Loading bids...</p>
                        </div>
                    </div>
                </div>`;
            auctionModal.style.display = 'block';

            // IMPORTANT: Fetch and render the leaderboard after the modal content is loaded
            fetchAndRenderLeaderboard(itemId, item.currentBid);

        } catch (error) {
            console.error('Error opening modal:', error);
            modalBody.innerHTML = `<p>Could not load auction details. Please try again later. Error: ${error.message}</p>`;
            auctionModal.style.display = 'block';
        }
    }
};

const closeModal = (type) => {
    if (type === 'auth') authModal.style.display = 'none';
    if (type === 'auction') auctionModal.style.display = 'none';
};

const updateCountdown = () => {
    document.querySelectorAll('.countdown').forEach(el => {
        const endTimeAttr = el.closest('.auction-card')?.dataset.endTime;
        if (!endTimeAttr) return;
        const endTime = parseInt(endTimeAttr);
        const timeRemaining = endTime - Date.now();
        if (timeRemaining < 0) {
            el.innerHTML = '<span class="expired"><i class="fas fa-clock"></i> Auction Ended!</span>';
            return;
        }
        const d = Math.floor(timeRemaining / 86400000);
        const h = Math.floor((timeRemaining % 86400000) / 3600000);
        const m = Math.floor((timeRemaining % 3600000) / 60000);
        const s = Math.floor((timeRemaining % 60000) / 1000);
        el.textContent = `${d}d ${h}h ${m}m ${s}s`;
    });
};
setInterval(updateCountdown, 1000);

const performSearch = () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = allAuctionItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
    );
    renderAuctionItems(filtered);
};

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderAuctions();
    updateLoginState();

    modalCloseBtn.onclick = () => closeModal('auction');
    authModalCloseBtn.onclick = () => closeModal('auth');
    window.onclick = (e) => {
        if (e.target == auctionModal) closeModal('auction');
        if (e.target == authModal) closeModal('auth');
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    auctionGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.auction-card');
        if (card) openModal('auction', card.dataset.itemId);
    });

    modalBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-place-bid')) {
            const bidInput = document.getElementById('bidAmount');
            // Ensure input value is a number and above 0
            const bidAmount = parseFloat(bidInput.value);
            if (bidAmount && bidAmount > 0) {
                placeBid(e.target.dataset.auctionId, bidAmount);
            } else {
                document.querySelector('.bid-message').textContent = 'Please enter a valid bid amount.';
                document.querySelector('.bid-message').style.color = '#dc3545';
            }
        }
    });
    
    userSection.addEventListener('click', (e) => {
        if (e.target.id === 'login-register-btn') {
            openModal('auth');
        }
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            updateLoginState();
        }
    });

    authModal.querySelector('.auth-tabs').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const tab = e.target.dataset.tab;
            authModal.querySelectorAll('.tab-content, .tab-link').forEach(el => el.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
            e.target.classList.add('active');
        }
    });

    document.getElementById('login-form').addEventListener('submit', (e) => handleAuthForm(e, 'login'));
    document.getElementById('register-form').addEventListener('submit', (e) => handleAuthForm(e, 'register'));

    if(createAuctionForm) {
        createAuctionForm.addEventListener('submit', handleCreateAuction);
    }
});