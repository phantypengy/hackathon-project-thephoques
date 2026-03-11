const { Pool } = require("pg");
const os = require("os");

const pool = new Pool({
  database: "sealio_database",
  user: os.userInfo().username,
  host: os.platform() === "darwin" ? "/tmp" : "/var/run/postgresql",
});

module.exports = pool;
