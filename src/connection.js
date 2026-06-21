import oracledb from 'oracledb'

let poolPromise = null

export function getOracleConfig(config = {}) {
  return {
    user: config.user ?? process.env.ORACLE_USER,
    password: config.password ?? process.env.ORACLE_PASSWORD,
    connectString: config.connectString ?? process.env.ORACLE_CONNECT_STRING,
    poolMin: config.poolMin ?? Number(process.env.ORACLE_POOL_MIN ?? 1),
    poolMax: config.poolMax ?? Number(process.env.ORACLE_POOL_MAX ?? 4),
    poolIncrement: config.poolIncrement ?? Number(process.env.ORACLE_POOL_INCREMENT ?? 1),
  }
}

export async function getOraclePool(config = {}) {
  if (!poolPromise) {
    const oracleConfig = getOracleConfig(config)

    if (!oracleConfig.user || !oracleConfig.password || !oracleConfig.connectString) {
      throw new Error('Missing ORACLE_USER, ORACLE_PASSWORD, or ORACLE_CONNECT_STRING')
    }

    poolPromise = oracledb.createPool(oracleConfig)
  }

  return poolPromise
}

export async function getOracleConnection(config = {}) {
  const pool = await getOraclePool(config)

  return pool.getConnection()
}
