# @oracle/simple-query

Experimental server-side helpers for running Oracle Database queries and working with JSON documents as simple collections.

> Disclaimer: This package is experimental sample code. It may contain bugs, incomplete behavior, and breaking changes. It is not intended for production environments and is not covered by Oracle support unless Oracle separately states otherwise.

## Install

```sh
npm install @oracle/simple-query oracledb
```

This package is designed for server-side JavaScript. Use it from Node.js services, Next.js Route Handlers, Server Actions, Server Components, or other server-only code paths. Do not import it from browser/client components.

## Configuration

By default, connection settings are read from environment variables:

```sh
ORACLE_USER=admin
ORACLE_PASSWORD=...
ORACLE_CONNECT_STRING=...
ORACLE_POOL_MIN=1
ORACLE_POOL_MAX=4
ORACLE_POOL_INCREMENT=1
```

You can also pass connection options to `runQuery`.

## Query API

```js
import { query, runQuery } from '@oracle/simple-query'

const result = await query(
  'select * from employees where department_id = :departmentId',
  { departmentId: 10 },
)

const resultWithConfig = await runQuery({
  sql: 'select * from employees fetch first :limit rows only',
  binds: { limit: 25 },
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
})
```

`query` returns an object with:

```js
{
  rows: [],
  rowsAffected: 0,
  metaData: []
}
```

## Collection API

The collection helpers assume each collection maps to an Oracle table with a JSON document column. The default JSON column name is `data`, and each document is expected to have an `_id` property. If `_id` is missing on insert, one is generated.

```js
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  replaceDocument,
} from '@oracle/simple-query'

const created = await createDocument('customers', {
  name: 'ACME Corp',
  status: 'active',
})

const documents = await getDocuments('customers', {
  limit: 25,
  orderBy: 'created_at',
})

const document = await getDocumentById('customers', created.document._id)

await replaceDocument('customers', created.document._id, {
  name: 'ACME Corp',
  status: 'inactive',
})

await deleteDocument('customers', created.document._id)
```

You can map public collection names to physical table names:

```js
const documents = await getDocuments('customers', {
  collections: {
    customers: 'app_customers',
  },
  dataColumn: 'payload',
})
```

Collection, table, column, and order-by identifiers are validated before being interpolated into SQL. Bind variables are used for values.

## API

### `getOracleConfig(config?)`

Returns the Oracle connection pool configuration after merging explicit options with environment variables.

### `getOraclePool(config?)`

Creates or returns the shared Oracle connection pool.

### `getOracleConnection(config?)`

Gets a connection from the shared pool.

### `query(sql, binds?, options?)`

Runs a SQL statement with bind variables and execution options.

### `runQuery(options)`

Runs a SQL statement with `sql`, `binds`, `options`, and optional Oracle connection configuration in one object.

### `getDocuments(collection, options?)`

Returns documents from a collection table.

### `getDocumentById(collection, id, options?)`

Returns one document by `_id`, or `null` when no document exists.

### `createDocument(collection, document, options?)`

Inserts a document and returns the stored document plus `rowsAffected`.

### `replaceDocument(collection, id, document, options?)`

Replaces a document by `_id` and returns the stored document plus `rowsAffected`.

### `deleteDocument(collection, id, options?)`

Deletes a document by `_id` and returns `rowsAffected`.

## Release checklist

Before publishing from the `@oracle` scope, confirm the package name, license, support statement, and release process with the appropriate Oracle owners.

```sh
npm run pack:check
npm publish
```
