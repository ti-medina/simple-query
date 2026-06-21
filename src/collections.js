import 'server-only'
import { randomUUID } from 'crypto'
import { query } from './query.js'

const namePattern = /^[A-Za-z][A-Za-z0-9_$#]*(\.[A-Za-z][A-Za-z0-9_$#]*)?$/

export async function getDocuments(collection, options = {}) {
  const orderBy = options.orderBy ? ` order by ${assertSafeName(options.orderBy, 'orderBy')}` : ''
  const limit = Number(options.limit ?? 100)
  const result = await query(
    `select data from ${collection} c${orderBy} fetch first :limit rows only`,
    { limit },
  )

  return result.rows.map(row => parseDocument(row.DATA ?? row.data))
}

export async function getDocumentById(collection, id, options = {}) {
  const result = await query(
    `select data from ${collection} where c.data."_id" = :id fetch first 1 row only`,
    { id },
  )
  const row = result.rows[0]

  if (!row) {
    return null
  }

  return parseDocument(row.DATA ?? row.data)
}

export async function createDocument(collection, document, options = {}) {
  const nextDocument = normalizeDocument(document, options)
  const result = await query(
    `insert into ${collection} (${dataColumn}) values (:data)`,
    { data: JSON.stringify(nextDocument) },
    { autoCommit: true },
  )

  return {
    document: nextDocument,
    rowsAffected: result.rowsAffected,
  }
}

export async function replaceDocument(collection, id, document, options = {}) {
  const nextDocument = normalizeDocument({ ...document, _id: id }, options)
  const result = await query(
    `update ${collection} c set ${dataColumn} = :data where c.${dataColumn}."$._id" = :id`,
    { id, data: JSON.stringify(nextDocument) },
    { autoCommit: true },
  )

  return {
    document: nextDocument,
    rowsAffected: result.rowsAffected,
  }
}

export async function deleteDocument(collection, id, options = {}) {
  const result = await query(
    `delete from ${collection} where c.${dataColumn}."$._id" = :id`,
    { id },
    { autoCommit: true },
  )

  return {
    rowsAffected: result.rowsAffected,
  }
}

function assertSafeName(name, label) {
  if (!name || typeof name !== 'string' || !namePattern.test(name)) {
    throw new Error(`Invalid ${label}`)
  }

  return name
}

function normalizeDocument(document, options) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('Document must be an object')
  }

  return {
    ...document,
    _id: document._id ?? options.idFactory?.() ?? randomUUID(),
  }
}

function parseDocument(value) {
  if (typeof value === 'string') {
    return JSON.parse(value)
  }

  return value
}
