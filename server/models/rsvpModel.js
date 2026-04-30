const pool = require('../db/pool');

// CREATES: a new rsvp returns the new row, or null if the user had already rsvp the event
module.exports.create = async (user_id, event_id) => {
    const query = `
    INSERT INTO rsvps (user_id, event_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *
    `;
    const { rows } = await pool.query(query, [user_id, event_id]);
    console.log(rows);
    return rows[0] || null;
};

// READ: Lists all the RSVP, who created them, how many events/users they have, and sorts them 
// by popularity
module.exports.list = async () => {
    const query = `
    SELECT *
    FROM rsvps
    WHERE rsvp_id = $1
    `;

    const { rows } = await pool.query(query);
    return rows;
};

// DELETE: Deletes the rsvp (the user will not be attending the event anymore)
module.exports.delete = async (rsvp_id) => {
    const query = `
    DELETE FROM rsvps
    WHERE rsvp_id = $1
    `;
    await pool.query(query, [rsvp_id]);
};