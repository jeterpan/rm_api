const http = require('http')

const cors = require('cors')
const morgan = require('morgan')
const express = require('express')

const configServidorWeb = require('../configs/servidor-web.js')

const roteador = require('../services/roteador.js')
const banco = require('../services/banco.js')

let httpServer

function inicializa() {
    return new Promise( (resolve, reject) => {
        const app = express()

        app.use(cors())

        httpServer = http.createServer(app)

        app.use(morgan('combined'))

        app.use('/api', roteador)

        // Vamos colocar este import aqui apenas para testarmos a conexao com o banco
        //  mas ele poderá ser apagado depois

        app.get('/', async (req, res) => {
            const resultado = await banco.executaSQL('select user, systimestamp from dual')
            const user = resultado.rows[0].USER
            const date = resultado.rows[0].SYSTIMESTAMP

            res.end(`DB user: ${user}\nDate: ${date}`)
        })

        httpServer.listen(configServidorWeb.http_port)
            .on('listening', () => {
                console.log(`Servidor Web escutando em localhost:${configServidorWeb.http_port}`)
            })
            .on('error', err => {
                reject(err)
            })
    })
}

module.exports.inicializa = inicializa

function encerra() {
    return new Promise( (resolve, reject) => {
        httpServer.close( (err) => {
            if (err) {
                reject(err)
                return
            }

            resolve()
        })
    })
}

module.exports.encerra = encerra
