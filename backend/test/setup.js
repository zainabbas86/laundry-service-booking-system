// Test bootstrap.
//
// The suite needs the real `bcrypt`, but its native binding is only built by
// the package's install script. On machines where `npm install` completed,
// nothing here runs. Where the binding is missing (CI sandbox, `npm ci
// --ignore-scripts`), a pure-JS stand-in keeps the suite runnable.
//
// The shim only affects tests; application code is untouched.

const Module = require('module');

let realBcrypt = null;
try {
    realBcrypt = require('bcrypt');
} catch (error) {
    realBcrypt = null;
}

if (!realBcrypt) {
    const crypto = require('crypto');

    const salt = (rounds = 10) => `$2b$${String(rounds).padStart(2, '0')}$testsalttestsaltte`;

    const digest = (password) =>
        '$2b$10$' + crypto.createHash('sha256').update(String(password)).digest('hex').slice(0, 53);

    const shim = {
        genSalt: async (rounds) => salt(rounds),
        hash: async (password) => digest(password),
        compare: async (password, hashed) => digest(password) === hashed,
    };

    const originalLoad = Module._load;
    Module._load = function load(request, parent, isMain) {
        if (request === 'bcrypt') return shim;
        return originalLoad.call(this, request, parent, isMain);
    };

    // eslint-disable-next-line no-console
    console.warn('[tests] bcrypt native binding missing - using pure-JS shim');
}
