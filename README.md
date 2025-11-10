🌐 GlobalAuction: Real-Time Bidding Platform
GlobalAuction is a full-stack, real-time auction platform designed to connect sellers and bidders from around the world. It features live bid tracking, secure user authentication, and a focus on highly engaging user experience.

✨ Key Features
This application showcases a modern approach to auction sites with a focus on real-time engagement and secure transactions.

Live Bid Leaderboard: View the top 5 unique bidders in real-time within the auction modal. The leaderboard updates instantly upon every new bid.

Secure Authentication: User registration and login using JWT for secure access.

Profile Picture Support: Users can upload profile images directly as Base64 data during registration for a personalized experience.

Seller Protection: Implements a crucial check to prevent sellers from placing bids on their own auction items (enforced on both frontend and backend).

Real-Time Data: Displays live countdown timers for active auctions.

Responsive Design: Fully optimized for browsing and bidding on desktop and mobile devices.

🛠️ Tech Stack
Frontend (Client)
HTML5 / CSS3: Structure and Styling.

Custom CSS: Utilizing modern Flexbox and Grid for responsive design.

JavaScript (Vanilla JS): Core logic, DOM manipulation, API interaction, and real-time updates.

Backend (API)
Node.js / Express: High-performance RESTful API server.

MongoDB / Mongoose: Flexible NoSQL database for auction, user, and bid data.

JWT (JSON Web Tokens): Secure authentication and authorization middleware.

🚀 Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
You must have the following installed:

Node.js & npm

MongoDB (running locally or a connection string for Atlas)

1. Installation
Clone the repository:

git clone (https://github.com/eager-31/onlinebidding.git)
cd GlobalAuction

Install dependencies (Frontend & Backend):

Navigate to your backend directory and run: npm install

(Assuming your frontend is served from the root or a separate directory)

2. Configuration
Create a file named .env in your backend root directory and add your environment variables:

MONGO_URI=mongodb+srv://harivansh123:harivansh123@cluster0.y2wgpaj.mongodb.net/biddingDB?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=thisisasecretphrasethatshouldbelongandrandom

Note: The server configuration is set to handle large file uploads (50mb limit) to support Base64 profile pictures.

3. Running the Application
Start the Backend Server:

npm run dev  # or whatever script you use (e.g., node server.js)

Start the Frontend:

Simply open index.html in your web browser. (Ensure your frontend's script.js has the correct API base URL: const API_BASE_URL = 'http://localhost:5000/api';)

💡 How to Use
Register: Create an account. You can optionally upload a profile picture file (it will be encoded to Base64 and saved).

Browse: View items on the homepage. Click "View Details" to open the auction modal.

Bid: Enter a bid amount higher than the current bid and click "Place Bid." Observe the Live Bid Leaderboard update instantly on the right.

Sell: Log in and use the "Sell Your Item" section to create a new auction. When viewing your own item, you will see a message blocking the bidding form.

📞 Contact
For support, please reach out to the contacts below.

Channel

Details

Email

hariladla@gmail.com

Mobile

+91 9523985175

Instagram

@harivans.hv

© 2025 GlobalAuction. All rights reserved.