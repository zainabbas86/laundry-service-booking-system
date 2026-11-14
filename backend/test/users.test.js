// TDD spec for adding users.
// Expected contract: POST /api/users
//   auth:     admin or manager only
//   body:     { name, email, password, role? }
//   success:  201 { id, name, email, role }  (never the password)
//   duplicate: 409  (do not create a second record for the same email)
//   invalid:  400  (missing fields, unknown role)

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

chai.use(chaiHttp);
const { expect } = chai;

const TEST_DOMAIN = '@lsbs-test.local';
const PASSWORD = 'superSecret123';
let counter = 0;

const bearer = (user) =>
    'Bearer ' + jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

const newEmail = (label) => `${label}.${++counter}${TEST_DOMAIN}`;

const validBody = (overrides = {}) => ({
    name: 'Test User',
    email: newEmail('user'),
    password: PASSWORD,
    role: ROLES.DRIVER,
    ...overrides,
});

describe('POST /api/users - adding users (TDD spec)', function () {
    this.timeout(15000);

    let admin;
    let manager;
    let customer;

    before(async function () {
        const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
        expect(uri, 'MONGO_URI (or MONGO_URI_TEST) must be set').to.be.a('string');

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri);
        }

        await User.deleteMany({ email: { $regex: 'lsbs-test\\.local$' } });

        admin = await User.create({
            name: 'Admin Test',
            email: `admin${TEST_DOMAIN}`,
            password: PASSWORD,
            role: ROLES.ADMIN,
        });

        manager = await User.create({
            name: 'Manager Test',
            email: `manager${TEST_DOMAIN}`,
            password: PASSWORD,
            role: ROLES.MANAGER,
        });

        customer = await User.create({
            name: 'Customer Test',
            email: `customer${TEST_DOMAIN}`,
            password: PASSWORD,
            role: ROLES.CUSTOMER,
        });
    });

    after(async function () {
        await User.deleteMany({ email: { $regex: 'lsbs-test\\.local$' } });
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('who is allowed to add users', function () {
        it('rejects a request with no token (401)', async function () {
            const res = await chai.request(app).post('/api/users').send(validBody());
            expect(res).to.have.status(401);
        });

        it('rejects a customer adding a user (403)', async function () {
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(customer))
                .send(validBody());
            expect(res).to.have.status(403);
        });

        it('allows a manager to add a driver (201)', async function () {
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(manager))
                .send(validBody({ role: ROLES.DRIVER }));
            expect(res).to.have.status(201);
        });
    });

    describe('validating the input', function () {
        it('rejects a missing email (400)', async function () {
            const body = validBody();
            delete body.email;
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(res).to.have.status(400);
        });

        it('rejects a missing password (400)', async function () {
            const body = validBody();
            delete body.password;
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(res).to.have.status(400);
        });

        it('rejects an unknown role (400)', async function () {
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(validBody({ role: 'wizard' }));
            expect(res).to.have.status(400);
        });

        it('rejects a malformed email (400)', async function () {
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(validBody({ email: 'not-an-email' }));
            expect(res).to.have.status(400);
        });
    });

    describe('creating the user', function () {
        it('creates a driver and returns it without the password', async function () {
            const body = validBody({ name: 'Eowyn', role: ROLES.DRIVER });
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);

            expect(res).to.have.status(201);
            expect(res.body).to.include({ name: 'Eowyn', role: ROLES.DRIVER });
            expect(res.body).to.have.property('id');
            expect(res.body).to.not.have.property('password');

            const saved = await User.findOne({ email: body.email });
            expect(saved, 'user should exist in the database').to.not.equal(null);
            expect(saved.role).to.equal(ROLES.DRIVER);
        });

        it('stores the password hashed, never as plain text', async function () {
            const body = validBody({ name: 'Hasher' });
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(res).to.have.status(201);

            const saved = await User.findOne({ email: body.email });
            expect(saved.password).to.not.equal(PASSWORD);
            expect(saved.password).to.match(/^\$2[aby]\$/);
        });

        it('normalises the email to lower case', async function () {
            const body = validBody({ email: `Mixed.Case.${counter + 1}${TEST_DOMAIN}`.toUpperCase() });
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(res).to.have.status(201);
            expect(res.body.email).to.equal(body.email.toLowerCase());
        });

        it('defaults the role to customer when none is given', async function () {
            const body = validBody();
            delete body.role;
            const res = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(res).to.have.status(201);
            expect(res.body.role).to.equal(ROLES.CUSTOMER);
        });
    });

    describe('when the user is already there', function () {
        it('rejects a duplicate email (409)', async function () {
            const body = validBody({ name: 'First' });
            const first = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(first).to.have.status(201);

            const second = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send({ ...body, name: 'Second' });
            expect(second).to.have.status(409);
        });

        it('does not create a second record for the same email', async function () {
            const body = validBody({ name: 'Only One' });
            await chai.request(app).post('/api/users').set('Authorization', bearer(admin)).send(body);
            await chai.request(app).post('/api/users').set('Authorization', bearer(admin)).send(body);

            const count = await User.countDocuments({ email: body.email });
            expect(count, 'duplicate email must not create a second user').to.equal(1);
        });

        it('treats the email as case-insensitive when checking duplicates', async function () {
            const body = validBody({ name: 'Case Test' });
            const first = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send(body);
            expect(first).to.have.status(201);

            const second = await chai
                .request(app)
                .post('/api/users')
                .set('Authorization', bearer(admin))
                .send({ ...body, email: body.email.toUpperCase() });
            expect(second).to.have.status(409);
        });
    });
});
