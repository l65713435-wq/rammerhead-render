const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, 'cache-js');
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

const express = require('express');
const path = require('path');

// Import the Rammerhead modules correctly
const RammerheadModules = require('./index');
const RammerheadProxy = RammerheadModules.RammerheadProxy;

// Initialize Express
const app = express();

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Rammerhead proxy
// Check if RammerheadProxy is a class or function
let proxy;
if (typeof RammerheadProxy === 'function') {
    // If it’s a constructor
    try {
        proxy = new RammerheadProxy();
    } catch (err) {
        // If it fails, maybe it’s a factory function
        proxy = RammerheadProxy();
    }
} else {
    throw new Error('RammerheadProxy is not a function or class');
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.send('Rammerhead proxy server is running!');
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Listen on Render-assigned port
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
