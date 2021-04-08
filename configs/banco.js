require('dotenv').config()

module.exports = {
    XMLpool: {
        bd_version: process.env.ORACLE_VERSION || 12,
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECTIONSTRING,
        poolMin: 10,
        poolMax: 10,
        poolIncrement: 0
    }
}
