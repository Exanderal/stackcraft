import 'dotenv/config';

async function seed() {
  // Add seed data here.
  // Example: connect to the DB and insert rows.
  console.log('Seed complete.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
