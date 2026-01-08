const path = require('path');
const fs = require('fs');
const os = require('os');
const RammerheadJSMemCache = require('./classes/RammerheadJSMemCache.js');
const RammerheadJSFileCache = require('./classes/RammerheadJSFileCache.js');

const enableWorkers = os.cpus().length !== 1;

module.exports = {
    //// HOSTING CONFIGURATION ////

    // Renderで動かすために '0.0.0.0' に変更
    bindingAddress: '0.0.0.0',
    // Renderのポート番号を自動で読み込むように変更
    port: process.env.PORT || 10000,
    crossDomainPort: 8081,
    publicDir: path.join(__dirname, '../public'), // set to null to disable

    // enable or disable multithreading
    enableWorkers,
    workers: os.cpus().length,

    // ssl object is either null or { key: fs.readFileSync('path/to/key'), cert: fs.readFileSync('path/to/cert') }
    ssl: null,

    // RenderのURLに自動で合わせるように設定を変更
    getServerInfo: (req) => {
        const host = req ? req.headers.host : 'localhost';
        return { hostname: host, port: 443, crossDomainPort: 443, protocol: 'https:' };
    },

    // enforce a password for creating new sessions. set to null to disable
    password: '',

    // disable or enable localStorage sync
    disableLocalStorageSync: false,

    // restrict sessions to be only used per IP
    restrictSessionToIP: true,

    // caching options for js rewrites.
    jsCache: new RammerheadJSFileCache(path.join(__dirname, '../cache-js'), 5 * 1024 * 1024 * 1024, 50000, enableWorkers),

    // whether to disable http2 support or not
    disableHttp2: false,

    //// REWRITE HEADER CONFIGURATION ////

    stripClientHeaders: [],
    rewriteServerHeaders: {},

    //// SESSION STORE CONFIG ////

    fileCacheSessionConfig: {
        saveDirectory: path.join(__dirname, '../sessions'),
        cacheTimeout: 1000 * 60 * 20, // 20 minutes
        cacheCheckInterval: 1000 * 60 * 10, // 10 minutes
        deleteUnused: true,
        staleCleanupOptions: {
            staleTimeout: 1000 * 60 * 60 * 24 * 3, // 3 days
            maxToLive: null,
            staleCheckInterval: 1000 * 60 * 60 * 6 // 6 hours
        },
        deleteCorruptedSessions: true,
    },

    //// LOGGING CONFIGURATION ////

    logLevel: process.env.DEVELOPMENT ? 'debug' : 'info',
    generatePrefix: (level) => `[${new Date().toISOString()}] [${level.toUpperCase()}] `,

    getIP: (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress
};

if (fs.existsSync(path.join(__dirname, '../config.js'))) Object.assign(module.exports, require('../config'));
