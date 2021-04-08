// Node.js native modules
// ...

// Third part modules
const express = require('express')

// App modules
const funcionario_rm = require('../models/funcionario-rm.js')


// Get method

async function get(req, res, next) {

	let retorno = {}

	console.log(req.query)

	const contexto = req.query

	console.log(contexto)

	//req.cod_cliente = url.parse(req.url,true).query

	if(contexto.chapa == 'undefined' && contexto.cpf == 'undefined') {
		res.status(400).json(`{ erro: 'Deve-se informar na requisição pelo menos um dos query parameters: chapa ou cpf' }`)
		return
	}

	if(!contexto.chapa == 'undefined' && !contexto.cpf == 'undefined') {
		res.status(400).json(`{ erro: 'Deve-se infomar na requisição apenas um dos query parameters: chapa ou cpf'`)
	}

	const limitePadraoRegistros = 3500

	if (req.query.limite) {
		contexto.limite = parseInt(req.query.limite, 10)
	} else {
		contexto.limite = limitePadraoRegistros
	}

	// ?pagina=

	if (req.query.pagina) {
		contexto.pagina = parseInt(req.query.pagina, 10)
		contexto.proximo = ( parseInt(req.query.pagina, 10) * contexto.limite ) - contexto.limite + 1
	} else {
		contexto.pagina = 1
		contexto.proximo = 1
	}

	// ?ordenar=

	// Formato esperado: ?ordenar=dat_vencto_s_desc:DESC

	if (req.query.ordenar) {
		contexto.ordenar = req.query.ordenar
	}

	try {

		const resultado_conta = await funcionario_rm.conta(contexto)

		const resultado_registros = await funcionario_rm.consulta(contexto)

		retorno = { pagina: contexto.pagina,
		total_de_paginas: Math.ceil( resultado_conta.TOTAL_DE_REGISTROS / contexto.limite, 10 ),
		limite: contexto.limite,
		total_de_registros: resultado_conta.TOTAL_DE_REGISTROS,
		dados: resultado_registros
		}

		res.status(200).json(retorno)

	} catch (erro) {

		res.status(500).json(`{ mensagem: ${erro} }`)

	}

}

module.exports.get = get
