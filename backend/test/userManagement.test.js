const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

chai.use(chaiHttp);
const { expect } = chai;

const TEST_DOMAIN = '@lsbs-manage.local';
const PASSWORD = 'superSecret123';

const bearer = (user) =>
    'Bearer ' + jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

const makeUser = (label, role) =>
    User.create({ name: `${label} Test`, email: `${label}${TEST_DOMAIN}`, password: PASSWORD, role });

describe('Admin user management - GET, PUT and DELETE /api/users', function () {
    this.timeout(15000);

    let admin;
    let otherAdmin;
    let manager;
    let driver;

    before(async function () {
        const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri);
        }
    });

    beforeEach(async function () {
        await User.deleteMany({ email: { $regex: 'lsbs-manage\\.local$' } });
        admin = await makeUser('admin', ROLES.ADMIN);
        otherAdmin = await makeUser('admin2', ROLES.ADMIN);
        manager = await makeUser('manager', ROLES.MANAGER);
        driver = await makeUser('driver', ROLES.DRIVER);
    });

    after(async function () {
        await User.deleteMany({ email: { $regex: 'lsbs-manage\\.local$' } });
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    describe('listing users', function () {
        it('lets an admin list users without passwords', async function () {
            const res = await chai.request(app).get('/api/users').set('Authorization', bearer(admin));
            expect(res).to.have.status(200);
            const found = res.body.find((u) => u.email === driver.email);
            expect(found).to.include({ name: 'driver Test', role: ROLES.DRIVER });
            expect(found).to.not.have.property('password');
        });

        it('rejects a manager (403)', async function () {
            const res = await chai.request(app).get('/api/users').set('Authorization', bearer(manager));
            expect(res).to.have.status(403);
        });
    });

    describe('editing a user', function () {
        it('updates name, email and role', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${driver.id}`)
                .set('Authorization', bearer(admin))
                .send({ name: 'Renamed', email: `RENAMED${TEST_DOMAIN}`, role: ROLES.MANAGER });
            expect(res).to.have.status(200);
            expect(res.body).to.include({ name: 'Renamed', email: `renamed${TEST_DOMAIN}`, role: ROLES.MANAGER });
        });

        it('sets a new password, stored hashed', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${driver.id}`)
                .set('Authorization', bearer(admin))
                .send({ password: 'brandNewPass456' });
            expect(res).to.have.status(200);

            const stored = await User.findById(driver.id);
            expect(stored.password).to.not.equal('brandNewPass456');
            expect(await bcrypt.compare('brandNewPass456', stored.password)).to.equal(true);
        });

        it('rejects an email that another user has (409)', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${driver.id}`)
                .set('Authorization', bearer(admin))
                .send({ email: manager.email });
            expect(res).to.have.status(409);
        });

        it('rejects an unknown role (400)', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${driver.id}`)
                .set('Authorization', bearer(admin))
                .send({ role: 'owner' });
            expect(res).to.have.status(400);
        });

        it('stops an admin demoting another admin (403)', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${otherAdmin.id}`)
                .set('Authorization', bearer(admin))
                .send({ role: ROLES.MANAGER });
            expect(res).to.have.status(403);
        });

        it('lets an admin demote themselves when another admin exists', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${admin.id}`)
                .set('Authorization', bearer(admin))
                .send({ role: ROLES.MANAGER });
            expect(res).to.have.status(200);
            expect(res.body.role).to.equal(ROLES.MANAGER);
        });

        it('returns 404 for an unknown id', async function () {
            const res = await chai
                .request(app)
                .put(`/api/users/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', bearer(admin))
                .send({ name: 'Nobody' });
            expect(res).to.have.status(404);
        });
    });

    describe('deleting a user', function () {
        it('deletes a driver', async function () {
            const res = await chai.request(app).delete(`/api/users/${driver.id}`).set('Authorization', bearer(admin));
            expect(res).to.have.status(200);
            expect(await User.exists({ _id: driver._id })).to.equal(null);
        });

        it('stops an admin deleting their own account (400)', async function () {
            const res = await chai.request(app).delete(`/api/users/${admin.id}`).set('Authorization', bearer(admin));
            expect(res).to.have.status(400);
        });

        it('stops an admin deleting another admin (403)', async function () {
            const res = await chai
                .request(app)
                .delete(`/api/users/${otherAdmin.id}`)
                .set('Authorization', bearer(admin));
            expect(res).to.have.status(403);
        });

        it('rejects a manager (403)', async function () {
            const res = await chai.request(app).delete(`/api/users/${driver.id}`).set('Authorization', bearer(manager));
            expect(res).to.have.status(403);
        });
    });
});
