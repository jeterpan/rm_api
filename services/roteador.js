const express = require('express')
const roteador = new express.Router()

const funcionario_rm = require('../controllers/funcionario-rm.js')

roteador.route('/funcionario_rm')
    .get(funcionario_rm.get)

module.exports = roteador
