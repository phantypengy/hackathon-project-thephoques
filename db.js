const { Pool } = require('pg');

const pool = new Pool({
    database: 'sealio_database',
    user: 'sealio',
    password: '',
    host: '/var/run/postgresql',
});

module.exports = pool;