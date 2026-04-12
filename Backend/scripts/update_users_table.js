const { query } = require('../database/connection');

const alterTable = async () => {
  try {
    console.log('Running ALTER TABLE...');
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS profession VARCHAR(100),
      ADD COLUMN IF NOT EXISTS languages TEXT[],
      ADD COLUMN IF NOT EXISTS skills TEXT[],
      ADD COLUMN IF NOT EXISTS clubs TEXT[],
      ADD COLUMN IF NOT EXISTS favorite_shows TEXT[],
      ADD COLUMN IF NOT EXISTS favorite_movies TEXT[],
      ADD COLUMN IF NOT EXISTS favorite_music TEXT[];
    `);
    console.log('ALTER TABLE successful!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to alter table:', error);
    process.exit(1);
  }
};

alterTable();
