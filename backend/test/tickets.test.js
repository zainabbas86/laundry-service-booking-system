const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = require('../server');
const User = require('../models/User');
const Store = require('../models/Store');
const Ticket = require('../models/Ticket');
const { ROLES } = require('../constants/roles');
const { SERVICES, SERVICE_LIST, RETURN_METHODS, STATUSES } = require('../constants/tickets');

chai.use(chaiHttp);
const { expect } = chai;

const TEST_DOMAIN = '@lsbs-ticket.local';
const STORE_NAME = 'TEST Sydney CBD';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const bearer = (user) =>
    'Bearer ' + jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

const makeUser = (label, role) =>
    User.create({ name: `${label} Test`, email: `${label}${TEST_DOMAIN}`, password: 'superSecret123', role });

const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');

describe('Workflow A tickets - /api/tickets', function () {
    this.timeout(15000);

    let store;
    let alice;
    let bob;
    let manager;

    before(async function () {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
        }
        await Ticket.init();
    });

    beforeEach(async function () {
        await Ticket.deleteMany({});
        await Store.deleteMany({ name: /^TEST / });
        await User.deleteMany({ email: { $regex: 'lsbs-ticket\\.local$' } });

        store = await Store.create({ name: STORE_NAME, address: '12 George St, Sydney' });
        alice = await makeUser('alice', ROLES.CUSTOMER);
        bob = await makeUser('bob', ROLES.CUSTOMER);
        manager = await makeUser('manager', ROLES.MANAGER);
    });

    after(async function () {
        await Ticket.deleteMany({});
        await Store.deleteMany({ name: /^TEST / });
        await User.deleteMany({ email: { $regex: 'lsbs-ticket\\.local$' } });
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });

    const slots = async () => {
        const res = await chai
            .request(app)
            .get('/api/tickets/slots')
            .query({ store: store.id, date: tomorrow() })
            .set('Authorization', bearer(alice));
        expect(res).to.have.status(200);
        return res.body.slots.map((slot) => slot.start);
    };

    const bookAs = (user, pickupSlot, overrides = {}) =>
        chai
            .request(app)
            .post('/api/tickets')
            .set('Authorization', bearer(user))
            .send({
                store: store.id,
                service: SERVICES.WASH_AND_FOLD,
                pickupSlot,
                pickupAddress: '1 Test St, Sydney',
                returnMethod: RETURN_METHODS.COLLECTION,
                ...overrides,
            });

    const cancel = (user, id) =>
        chai.request(app).patch(`/api/tickets/${id}/cancel`).set('Authorization', bearer(user));

    it('TC05: creates a ticket with a UUID, Awaiting pickup status and a booking log', async function () {
        const [slot] = await slots();
        const res = await bookAs(alice, slot);

        expect(res).to.have.status(201);
        expect(res.body.ticketNo).to.match(UUID_V4);
        expect(res.body.status).to.equal(STATUSES.AWAITING_PICKUP);
        expect(res.body.service).to.equal(SERVICES.WASH_AND_FOLD);
        expect(res.body.store).to.include({ id: store.id, name: STORE_NAME });
        expect(res.body.log[0]).to.include({ action: 'Booked', byName: 'alice Test' });
        expect(await Ticket.exists({ ticketNo: res.body.ticketNo })).to.not.equal(null);
    });

    it('TC06: rejects a second booking for the same pickup slot', async function () {
        const [slot] = await slots();
        expect(await bookAs(alice, slot)).to.have.status(201);

        const clash = await bookAs(bob, slot);

        expect(clash).to.have.status(409);
        expect(await Ticket.countDocuments({ pickupSlot: new Date(slot) })).to.equal(1);
    });

    it('TC07: stores a delivery slot for delivery and none for collection', async function () {
        const [first, second] = await slots();
        const deliverySlot = new Date(new Date(first).getTime() + 2 * 60 * 60 * 1000).toISOString();

        const delivery = await bookAs(alice, first, {
            returnMethod: RETURN_METHODS.DELIVERY,
            deliverySlot,
        });
        const collection = await bookAs(bob, second, { returnMethod: RETURN_METHODS.COLLECTION });

        expect(delivery).to.have.status(201);
        expect(new Date(delivery.body.deliverySlot).toISOString()).to.equal(deliverySlot);
        expect(collection).to.have.status(201);
        expect(collection.body.deliverySlot).to.equal(null);
    });

    it('TC07: requires a delivery slot when the customer asks for delivery', async function () {
        const [slot] = await slots();
        const res = await bookAs(alice, slot, { returnMethod: RETURN_METHODS.DELIVERY });
        expect(res).to.have.status(400);
    });

    it('TC08: lists only the customer own tickets and hides other customers tickets', async function () {
        const [first, second] = await slots();
        await bookAs(alice, first);
        const bobsTicket = await bookAs(bob, second);

        const mine = await chai.request(app).get('/api/tickets/mine').set('Authorization', bearer(alice));
        const foreignCancel = await cancel(alice, bobsTicket.body.id);

        expect(mine).to.have.status(200);
        expect(mine.body.map((ticket) => ticket.pickupSlot)).to.deep.equal([first]);
        expect(foreignCancel).to.have.status(404);
    });

    it('TC12: lets a customer cancel before collection and frees the slot', async function () {
        const [slot] = await slots();
        const created = await bookAs(alice, slot);

        const res = await cancel(alice, created.body.id);

        expect(res).to.have.status(200);
        expect(res.body.status).to.equal(STATUSES.CANCELLED);
        expect(await slots()).to.include(slot);
        expect(await cancel(alice, created.body.id)).to.have.status(400);
        expect(await bookAs(bob, slot)).to.have.status(201);
    });

    it('TC12: stops a customer cancelling after collection but lets a manager cancel', async function () {
        const [slot] = await slots();
        const created = await bookAs(alice, slot);
        await Ticket.updateOne({ _id: created.body.id }, { status: STATUSES.PROCESSING });

        expect(await cancel(alice, created.body.id)).to.have.status(400);
        expect(await cancel(manager, created.body.id)).to.have.status(200);
    });

    it('TC13: rejects a booking without a session or from a non-customer', async function () {
        const [slot] = await slots();

        const anonymous = await chai.request(app).post('/api/tickets').send({ store: store.id });
        const asManager = await bookAs(manager, slot);

        expect(anonymous).to.have.status(401);
        expect(asManager).to.have.status(403);
    });

    it('TC14: stores each of the three services and rejects an unknown one', async function () {
        const picked = await slots();
        const unknown = await bookAs(alice, picked[0], { service: 'shoe repair' });

        for (const [index, service] of SERVICE_LIST.entries()) {
            const res = await bookAs(alice, picked[index + 1], { service });
            expect(res).to.have.status(201);
            expect(res.body.service).to.equal(service);
        }
        expect(unknown).to.have.status(400);
    });

    it('TC15: rejects a booking with a missing address or an invalid pickup slot', async function () {
        const [slot] = await slots();

        const noAddress = await bookAs(alice, slot, { pickupAddress: '  ' });
        const notASlot = await bookAs(alice, `${tomorrow()}T07:00:00`);

        expect(noAddress).to.have.status(400);
        expect(notASlot).to.have.status(400);
    });

    it('offers 30-minute pickup slots and drops a slot once it is booked', async function () {
        const before = await slots();
        await bookAs(alice, before[0]);
        const after = await slots();

        expect(before).to.have.lengthOf(20);
        expect(after).to.have.lengthOf(19);
        expect(after).to.not.include(before[0]);
    });
});
