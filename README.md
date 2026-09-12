# @oracle/simple-query

Experimental server-side helpers for running Oracle Database queries and working with JSON documents as simple collections.

> Disclaimer: This package is experimental sample code. It may contain bugs, incomplete behavior, and breaking changes. It is not intended for production environments and is not covered by Oracle support unless Oracle separately states otherwise.

## Install

```sh
npm install @oracle/simple-query oracledb
```

Or, using the github repository:

```sh
npm install git+https://github.com/ti-medina/simple-query.git#main
```

For manual installation from a local checkout, install the package with a `file:` dependency from the consuming project:

```sh
npm install file:../simple-query oracledb
```

Use the path that points to this package directory. For example, from a sibling Next.js app directory:

```sh
npm install file:../simple-query
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

Use `query` for statements that return rows, and `execute` for DML or DDL statements where you only need the affected row count or success status.

## Query API

```js
import { execute, query } from '@oracle/simple-query'

const result = await query(
  'select * from employees where department_id = :departmentId',
  { departmentId: 10 },
)

const deleted = await execute(
  'delete from employees where department_id = :departmentId',
  { departmentId: 10 },
  { autoCommit: true },
)

const created = await execute(
  'create table archived_employees (id number primary key, name varchar2(200))',
)
```

`query` returns an object with:

```js
{
  rows: [],
  rowsAffected: 0,
  metaData: []
}
```

`execute` returns an object with `rowsAffected` for DML statements:

```js
{
  rowsAffected: 3
}
```

For statements where Oracle does not report affected rows, such as many DDL statements, `execute` returns:

```js
{
  status: 'success'
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

const activeCustomers = await getDocuments('customers', {
  where: '"status" = \'active\'',
  orderBy: '"name"',
  limit: 25,
})

const customersByStatus = await getDocuments('customers', {
  select: '"status", count(*) as total',
  groupBy: '"status"',
  having: 'count(*) > 1',
  orderBy: 'total desc',
})

const document = await getDocumentById('customers', created.document._id)

await replaceDocument('customers', created.document._id, {
  name: 'ACME Corp',
  status: 'inactive',
})

await deleteDocument('customers', created.document._id)
```

`getDocuments` supports these query-shaping options:

- `select`: SQL select-list fragment. If omitted, the raw `data` document column is selected and parsed as JSON.
- `where`: SQL predicate fragment. A leading `where` keyword is optional.
- `groupBy`: SQL `group by` fragment. A leading `group by` keyword is optional.
- `having`: SQL `having` fragment. A leading `having` keyword is optional.
- `orderBy`: SQL `order by` fragment. A leading `order by` keyword is optional.
- `limit`: Maximum number of rows to return. Defaults to `100`.

Quoted JSON attributes are expanded to `c.data` references. For example, `"status" = 'active'` becomes `c.data."status" = 'active'` in the generated SQL.

These fragments are interpolated into SQL. Do not pass untrusted user input directly into `select`, `where`, `groupBy`, `having`, or `orderBy`.

## API

### `getOracleConfig(config?)`

Returns the Oracle connection pool configuration after merging explicit options with environment variables.

### `getOraclePool(config?)`

Creates or returns the shared Oracle connection pool.

### `getOracleConnection(config?)`

Gets a connection from the shared pool.

### `query(sql, binds?, options?)`

Runs a SQL statement with bind variables and execution options, returning `rows`, `rowsAffected`, and `metaData`.

### `execute(sql, binds?, options?)`

Runs a DML or DDL statement with bind variables and execution options, returning `rowsAffected` when available or `status: 'success'` otherwise.

### `getDocuments(collection, options?)`

Returns documents from a collection table. Supports `select`, `where`, `groupBy`, `having`, `orderBy`, and `limit` options.

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
