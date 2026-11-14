// Creates the first System Admin from environment variables.
// Safe to run more than once: it does nothing if an admin already exists.
// Usage: npm run seed (needs MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD)

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const { ROLES } = require('./constants/roles');

dotenv.config();

const seedAdmin = async () => {
    const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    const missing = ['MONGO_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']
        .filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    if (ADMIN_PASSWORD.length < 12) {
        throw new Error('ADMIN_PASSWORD must be at least 12 characters');
    }

    await mongoose.connect(MONGO_URI);

    if (await User.exists({ role: ROLES.ADMIN })) {
        console.log('An admin already exists. Nothing to do.');
        return;
    }

    const email = ADMIN_EMAIL.toLowerCase().trim();
    if (await User.exists({ email })) {
        throw new Error(`A non-admin user with ${email} already exists. Use another ADMIN_EMAIL.`);
    }

    await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: ROLES.ADMIN });
    console.log(`Admin created: ${email}`);
};

seedAdmin()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
        console.error(`Seed failed: ${error.message}`);
        await mongoose.disconnect();
        process.exit(1);
    });
