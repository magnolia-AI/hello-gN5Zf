import 'dotenv/config';
import db from './db';
//import { users, posts } from './schema';

async function main() {
  console.log('Starting database seed...');

  try {
    // Example seed data - modify according to your needs
    //console.log('Seeding users...');
    //   await db.insert(users).values([
    //     {
    //       name: 'John Doe',
    //       email: 'john@example.com',
    //     },
    //     {
    //       name: 'Jane Smith',
    //       email: 'jane@example.com',
    //     },
    //   ]);

    //   console.log('Seeding posts...');
    //   await db.insert(posts).values([
    //     {
    //       title: 'Getting Started with Drizzle',
    //       content: 'This is a post about getting started with Drizzle ORM.',
    //       published: true,
    //       authorId: 1,
    //     },
    //     {
    //       title: 'Migrating from Prisma to Drizzle',
    //       content: 'A guide on migrating from Prisma to Drizzle.',
    //       published: false,
    //       authorId: 2,
    //     },
    //   ]);

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  }); 