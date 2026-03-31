import { Kysely } from 'kysely';

export const createTable = (db: Kysely<any>, name: string) =>
  db.schema.createTable(name);

export const dropTable = (db: Kysely<any>, name: string) =>
  db.schema.dropTable(name).ifExists().execute();
