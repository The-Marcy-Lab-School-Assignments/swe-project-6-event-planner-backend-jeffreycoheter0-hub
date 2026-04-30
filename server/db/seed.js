const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 12;

const seed = async () => {
  // Drop in reverse dependency order to satisfy foreign key constraints.
  await pool.query('DROP TABLE IF EXISTS rsvps');
  await pool.query('DROP TABLE IF EXISTS events');
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE events (
      event_id      SERIAL PRIMARY KEY,
      title         TEXT NOT NULL,
      description   TEXT,
      date          TEXT NOT NULL,
      location      TEXT NOT NULL,
      event_type    TEXT NOT NULL,
      max_capacity  INTEGER NOT NULL,
      user_id       INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE rsvps (
      rsvp_id   SERIAL PRIMARY KEY,
      user_id   INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      event_id  INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
      UNIQUE (user_id, event_id)
    )
  `);

  // 2. Hash passwords for seed data
  // bcrypt.hash() is async, so Promise.all() runs all three hashes in parallel
  // instead of waiting for each one sequentially (~300ms per hash at 12 rounds).
  const [jeffreyHash, chrisHash, denisseHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  // 3. Insert seed data
  // RETURNING captures the inserted rows so we have the auto-generated user_ids.
  // This avoids hardcoding IDs, which would break if the sequence isn't reset.
  const { rows: users } = await pool.query(`
    INSERT INTO users (username, password_hash) VALUES
      ('jeffrey', $1),
      ('chris',   $2),
      ('denisse', $3)
    RETURNING user_id, username
  `, [jeffreyHash, chrisHash, denisseHash]);

  const [jeffrey, chris, denisse] = users;

  const { rows: events } = await pool.query(`
    INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id) VALUES
      ('AnimeNYC', 'New York Citys anime convention', 'August 20-23, 2026', 'Javits Center', 'convention', 148000, $1),
      ('NYCC', 'New York Comic Con', 'October 8-11, 2026', 'Javits Center', 'convention', 250000, $2),
      ('Fifa World Cup', 'International soccer tournament', 'June 11-July 19, 2026', 'USA, Canada, Mexico', 'tournament', 70000, $3)
      RETURNING *
  `, [jeffrey.user_id, chris.user_id, denisse.user_id]);

  const [animeNYC, nycc, fifaWorldCup] = events;

  // Each pair below must be unique.
  await pool.query(`
    INSERT INTO rsvps (user_id, event_id) VALUES
      ($1, $2),
      ($1, $4),
      ($5, $4),
      ($5, $6),
      ($3, $6);
  `, [
    jeffrey.user_id,  // $1
    animeNYC.event_id,  // $2
    chris.user_id,  // $3
    nycc.event_id,  // $4
    denisse.user_id,  // $5
    fifaWorldCup.event_id // $6
  ]);

  return { users, events };
};

seed()
  .then(({ users, events }) => {
    console.log('Database seeded successfully.');
    console.log(`  Users: ${users.map((u) => u.username).join(', ')}`);
    console.log(`  Events: ${events.map((e) => e.title).join(', ')}`);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());