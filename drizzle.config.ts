/*
This file is used to connect to the database.
Changing it may break behavior of the magnolia.
Only change it if you know what you are doing and dont rely on magnolia to deploy.
*/


import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/schema.ts',
  out: './lib/drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
}); 