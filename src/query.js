import oracledb from 'oracledb'
import { getOracleConnection } from './connection.js'

export async function query(sql, binds = {}, options = {}) {
  return runQuery({ sql, binds, options })
}

export async function runQuery(queryOptions) {
  const { sql, binds = {}, options = {}, ...connectionConfig } = queryOptions

  if (!sql || typeof sql !== 'string') {
    throw new Error('A SQL query string is required')
  }

  const connection = await getOracleConnection(connectionConfig)

  try {
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    })

    return {
      rows: result.rows ?? [],
      rowsAffected: result.rowsAffected ?? 0,
      metaData: result.metaData ?? [],
    }
  } finally {
    await connection.close()
  }
}
