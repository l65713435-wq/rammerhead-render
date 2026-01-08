const path = require('path');
const fs = require('fs');
const os = require('os');
const RammerheadJSMemCache = require('./classes/RammerheadJSMemCache.js');
const RammerheadJSFileCache = require('./classes/RammerheadJSFileCache.js');

const enableWorkers = os.cpus().length !== 1;

module.exports = {
    //// HOSTING CONFIGURATION ////

    bindingAddress: '0.0.0.0',
    port: process.env.PORT || 10000,
    // 予備ポートをnullにして、Renderの勘違いを防ぐよ
    crossDomainPort: null, 
    publicDir: path.join(__dirname, '../public'),

    enableWorkers,
    workers: os.cpus().length,
    ssl: null,

    getServerInfo: (req) => {
        const host = req ? req.headers.host : 'localhost';
        // Renderは外部からHTTPSで繋がるので設定を固定
        return { hostname: host, port: 443, crossDomainPort: null, protocol: 'https:' };
    },

    password: '',
    disableLocalStorageSync: false,
    restrictSessionToIP: false, // 学校などIPが変わる環境のためにfalseがおすすめ

    jsCache: new RammerheadJSFileCache(path.join(__dirname, '../cache-js'), 5 * 1024 * 1024 * 1024, 50000, enableWorkers),
    disableHttp2: false,

    //// REWRITE HEADER CONFIGURATION ////
    stripClientHeaders: [],
    rewriteServerHeaders: {},

    //// SESSION STORE CONFIG ////
    fileCacheSessionConfig: {
        saveDirectory: path.join(__dirname, '../sessions'),
        cacheTimeout: 1000 * 60 * 20,
        cacheCheckInterval: 1000 * 60 * 10,
        deleteUnused: true,
        staleCleanupOptions: {
            staleTimeout: 1000 * 60 * 60 * 24 * 3,
            maxToLive: null,
            staleCheckInterval: 1000 * 60 * 60 * 6
        },
        deleteCorruptedSessions: true,
    },

    //// LOGGING CONFIGURATION ////
    logLevel: process.env.DEVELOPMENT ? 'debug' : 'info',
    generatePrefix: (level) => `[${new Date().toISOString()}] [${level.toUpperCase()}] `,
    getIP: (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress
};

if (fs.existsSync(path.join(__dirname, '../config.js'))) Object.assign(module.exports, require('../config'));
