// Third part modules
const oracledb = require('oracledb')

// App modules
const configOracleDB = require('../configs/banco.js')


// Initializes a pool of connections for Oracle Database, using the node-oracledb driver

async function inicializa() {
    const pool = await oracledb.createPool(configOracleDB.XMLpool)
}

module.exports.inicializa = inicializa


// Close the pool of connections of Oracle Database

async function close() {
    await oracledb.getPool().close()
}

module.exports.close = close


// Executes a SQL statement

function executaSQL(declaracao, binds = [], opcoes = {}) {
    return new Promise(async (resolve, reject) => {
        let connection

        opcoes.outFormat = oracledb.OUT_FORMAT_OBJECT
        opcoes.autoCommit = true

        if(opcoes.campoBLOB) {
            opcoes.fetchInfo = {
                "XML_SIG": {type: oracledb.BUFFER},
                "XML_PROT": {type: oracledb.BUFFER}
            }
            oracledb.fetchAsBuffer = [ oracledb.BLOB ]
        }

        try {
            connection = await oracledb.getConnection()

            await connection.execute(`ALTER SESSION SET TIME_ZONE='America/Sao_Paulo'`)

            const result = await connection.execute(declaracao, binds, opcoes)

            resolve(result)
        } catch (err) {
            reject(err)
        } finally {
            if (connection) {
                try {
                    await connection.close()
                } catch (err) {
                    console.err(err)
                }
            }
        }
    })
}

module.exports.executaSQL = executaSQL
