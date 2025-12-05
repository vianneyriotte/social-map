#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate version in format DDMMAA HHMMSSms
const now = new Date();

const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = String(now.getFullYear()).slice(-2);
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
const ms = String(now.getMilliseconds()).padStart(3, '0');

const version = `${day}${month}${year} ${hours}${minutes}${seconds}${ms}`;

const versionFilePath = path.join(__dirname, '..', 'src', 'version.json');

fs.writeFileSync(versionFilePath, JSON.stringify({ version, generatedAt: now.toISOString() }, null, 2));

console.log(`Version generated: ${version}`);
