// We can hardcode the roles for now, if needed maybe add them to db as well
const ROLES = Object.freeze({
    ADMIN: 'admin',
    MANAGER: 'manager',
    DRIVER: 'driver',
    CUSTOMER: 'customer',
});

module.exports = { ROLES, ROLE_LIST: Object.values(ROLES) };
