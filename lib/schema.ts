import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// // Example users table - modify according to your needs
// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 255 }).notNull(),
//   email: varchar('email', { length: 255 }).notNull().unique(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// // Example posts table - modify according to your needs
// export const posts = pgTable('posts', {
//   id: serial('id').primaryKey(),
//   title: varchar('title', { length: 255 }).notNull(),
//   content: text('content'),
//   published: boolean('published').default(false).notNull(),
//   authorId: integer('author_id').references(() => users.id),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// // Type exports
// export type User = typeof users.$inferSelect;
// export type NewUser = typeof users.$inferInsert;
// export type Post = typeof posts.$inferSelect;
// export type NewPost = typeof posts.$inferInsert; 