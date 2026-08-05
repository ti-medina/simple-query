import oracledb from 'oracledb'
import { getOracleConnection } from './connection.js'

export async function query(sql, binds = {}, options = {}) {
  const result = await executeStatement(sql, binds, options)

  return {
    rows: result.rows ?? [],
    rowsAffected: result.rowsAffected ?? 0,
    metaData: result.metaData ?? [],
  }
}

export async function execute(sql, binds = {}, options = {}) {
  const result = await executeStatement(sql, binds, options)

  if (typeof result.rowsAffected === 'number') {
    return {
      rowsAffected: result.rowsAffected,
    }
  }

  return {
    status: 'success',
  }
}

async function executeStatement(sql, binds = {}, options = {}) {
  if (!sql || typeof sql !== 'string') {
    throw new Error('A SQL query string is required')
  }

  const connection = await getOracleConnection()

  try {
    return await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    })
  } finally {
    await connection.close()
  }
}
