const configOracleDB = require('../configs/banco.js')
const banco = require('../services/banco.js')

const sqlSubConsultas = `
WITH
`

const sqlContar = `\n
    SELECT COUNT(1) as total_de_registros
`

const sqlSelect = `\n

SELECT
    a.codcoligada,
    a.chapa,
    a.nome,
    b.cpf,
    b.email,
    a.codsecao,
    c.descricao,
    a.codfuncao,
    --d.nome,
    a.datademissao
`

const sqlFrom = 
`\n
FROM
    ${configOracleDB.schema_rm}.pfunc    a,
    ${configOracleDB.schema_rm}.ppessoa  b,
    ${configOracleDB.schema_rm}.psecao   c,
    ${configOracleDB.schema_rm}.pfuncao  d
`

const sqlWhere = 
`
\n
WHERE
        a.codpessoa = b.codigo
    AND a.codcoligada = c.codcoligada
    AND a.codsecao = c.codigo
    AND a.codcoligada = d.codcoligada
    AND a.codfuncao = d.codigo
    AND a.codsituacao <> 'D'
    AND a.codcoligada IN ( 2, 6, 8 )
`

const sqlFetch = '\nFETCH NEXT :row_limit ROWS ONLY'

// -- ------------------------------------------------------------------------------
// COMPATIBILIDADE ORACLE 11G, devido este não ter OFFSET; a partir do 12c existe esta funcionalidade
// TODO: Tão logo atualizar o Oracle, revisar para eliminar esta sub-consulta e usar OFFSET
const sqlSubConsultaNumerar = `
\n, numera_registros AS (
    SELECT ROWNUM AS linha
            , cp.*
        FROM consulta_principal cp
)
`

const sqlOffSet = `\n
                        SELECT *
                        FROM numera_registros
                        WHERE linha >= :proximo`

const sqlRownum = `\n
                    AND rownum <= :row_limit
`

// -- ------------------------------------------------------------------------------

async function conta(contexto) {

    let sqlWhereCompl = ''

    const binds = {}

    if (contexto.chapa) {
        binds.chapa = contexto.chapa

        sqlWhereCompl += `\n AND a.chapa = :chapa`
        
    }

    if (contexto.cpf) {
        binds.cpf = contexto.cpf

        sqlWhereCompl += `\n AND b.cpf = :cpf`
        
    }

    let declaracaoSQL = sqlContar + sqlFrom + sqlWhere + sqlWhereCompl

    const result = await banco.executaSQL(declaracaoSQL, binds)

    // Limpeza
    sqlWhereCompl = ''
    declaracaoSQL = ''

    return result.rows[0]
}

module.exports.conta = conta


// Consulta

async function consulta(contexto) {

    let declaracaoSQL = ''


    // Compatibilidade Oracle 11
    let consultaPrincipal = ''


    // Paginação

    const binds = {}

    if (contexto.proximo) {
        binds.proximo = contexto.proximo
    } else {
        binds.proximo = 1
    }

    // Filtros

    let sqlWhereCompl = ''

    if (contexto.chapa) {
        binds.chapa = contexto.chapa

        sqlWhereCompl += `\n AND a.chapa = :chapa`
        
    }

    if (contexto.cpf) {
        binds.cpf = contexto.cpf

        sqlWhereCompl += `\n AND b.cpf = :cpf`
        
    }

    consultaPrincipal = sqlSelect + sqlFrom + sqlWhere + sqlWhereCompl


    // Monta a declaração SQL

    // Compatibilidade com Oracle 11
    if(configOracleDB.XMLpool.bd_version == 11) {
        declaracaoSQL += sqlSubConsultas + `\n consulta_principal as ( ${consultaPrincipal} )` + sqlSubConsultaNumerar + sqlOffSet
    } else {
        declaracaoSQL += consultaPrincipal
    }

    // Limite de registros na Página

    const limite = ( contexto.limite > 0 ) ? contexto.limite : 500

    binds.row_limit = limite

    if(configOracleDB.XMLpool.bd_version == 11) {
        // Compatibilidade com Oracle 11
        declaracaoSQL += sqlRownum
    } else {

        // A partir do Oracle 12, temos esta funcionalidade
        declaracaoSQL += sqlFetch
    }

    const result = await banco.executaSQL(declaracaoSQL, binds)

    // Limpeza
    sqlWhereCompl = ''
    consultaPrincipal = ''
    declaracaoSQL = ''
    
    return result.rows
}

module.exports.consulta = consulta
