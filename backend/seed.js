// Creates the first System Admin (from environment variables) and the one store.
// Safe to run more than once: anything that already exists is left alone.
// Usage: npm run seed (needs MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD)

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Store = require('./models/Store');
const { ROLES } = require('./constants/roles');

dotenv.config();

const DEFAULT_STORE = { name: 'Sydney CBD', address: 'Sydney NSW 2000' };

const seedAdmin = async () => {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (await User.exists({ role: ROLES.ADMIN })) {
        console.log('Admin: already exists. Nothing to do.');
        return;
    }

    if (ADMIN_PASSWORD.length < 12) {
        throw new Error('ADMIN_PASSWORD must be at least 12 characters');
    }

    const email = ADMIN_EMAIL.toLowerCase().trim();
    if (await User.exists({ email })) {
        throw new Error(`A non-admin user with ${email} already exists. Use another ADMIN_EMAIL.`);
    }

    await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: ROLES.ADMIN });
    console.log(`Admin: created ${email}`);
};

const seedStore = async () => {
    if (await Store.exists({})) {
        console.log('Store: already exists. Nothing to do.');
        return;
    }

    await Store.create(DEFAULT_STORE);
    console.log(`Store: created ${DEFAULT_STORE.name}`);
};

const seed = async () => {
    const missing = ['MONGO_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
        .filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    await mongoose.connect(process.env.MONGO_URI);
    await seedAdmin();
    await seedStore();
};

seed()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
        console.error(`Seed failed: ${error.message}`);
        await mongoose.disconnect();
        process.exit(1);
    });
