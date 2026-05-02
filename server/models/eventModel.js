// const { use } = require('react');
const pool = require('../db/pool'); // imports the file/module(pool.js) -> runs the file -> returns whatever is in that file

// READ: Lists all the events, who created them, how many rsvp it has, and sorts them 
// by popularity
module.exports.list = async () => {
    const query = `
    SELECT 
        events.event_id,
        events.title,
        events.description,
        events.date,
        events.location,
        events.event_type,
        events.max_capacity,
        COUNT (rsvps.user_id) AS rsvp_count
    FROM events
    INNER JOIN users ON events.user_id = users.user_id
    LEFT JOIN rsvps ON events.event_id = rsvps.event_id
    GROUP BY events.event_id, users.user_id
    ORDER BY rsvp_count ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Returns all the events for a specific user
module.exports.listByUser = async (user_id) => {
    const query = `SELECT * 
    FROM events 
    WHERE user_id = $1
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
};

// Return a single event row (including user_id for ownership checks)
// if the event exists return it, otherwise return NULL
module.exports.find = async (event_id) => {
    const query = `
    SELECT *
    FROM events
    WHERE event_id = $1
    `;
    const { rows } = await pool.query(query, [event_id]);
    return rows[0] || null;
};

// CREATE : creates an event the user will attend, returns the newly created event
module.exports.create = async (user_id, title, description, date, location, event_type, max_capacity) => {
    const query = `
    INSERT INTO events (user_id, title, description, date, location, event_type, max_capacity)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `;
    const { rows } = await pool.query(query, [user_id, title, description, date, location, event_type, max_capacity]);
    return rows[0];
};

// UPDATE: Updates their events by title and date
module.exports.update = async (user_id, title, date) => {
    const query = `
    SELECT title, date
    FROM events
    WHERE user_id = $1
    ORDER BY event_id
    `;
    const { rows } = await pool.query(query, [user_id, title, date]);
    return rows;
};

// DELETE: Deletes the event the user will not be attending anymore
module.exports.delete = async (event_id, user_id) => {
    const query = `
    DELETE FROM events
    WHERE event_id = $1 AND user_id = $2
    `;
    await pool.query(query, [event_id, user_id]);
};