const express = require('express');
const app = require('./server'); // This might not work if server.js starts listening immediately

// Better approach: Re-instantiate the app structure as if we are server.js to see routes
// But server.js executes 'app.listen' at the end.
// Let's modify server.js slightly to export app? 
// Or just read the files? No, runtime inspection is better.

// Let's write a script that requires the route files directly and prints them.
const authRouter = require('./routes/auth');
const resourceRouter = require('./routes/resources');

console.log('--- Auth Routes ---');
authRouter.stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
});

console.log('\n--- Resource Routes ---');
resourceRouter.stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
});
