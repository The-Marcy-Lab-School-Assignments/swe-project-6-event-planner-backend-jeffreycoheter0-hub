const rsvpModel = require('../models/rsvpModel');

module.exports.listAllRsvp = async (req, res, next) => {
    try {
        const rsvp = await rsvpModel.list();
        res.send(rsvp);
    } catch (err) {
        next(err);
    }
};

module.exports.createRsvp = async (req, res, next) => {
    try {
        const { event_id } = req.body;
        if (!event_id) {
            return res.status(400).send({ error: 'Event is required.' });
        }
        const rsvp = await rsvpModel.create(event_id, req.session.user_id);
        res.status(201).send(rsvp);
    } catch (err) {
        next(err);
    }
};

module.exports.deleteRsvp = async (req, res, next) => {
    try {
        const { rsvp_id } = req.params;
        const rsvp = await rsvpModel.find(rsvp_id);
        if (!rsvp) return res.status(404).send({ error: 'Rsvp not found.' });
        if (rsvp.user_id !== req.session.user_id) {
            return res.status(403).send({ error: 'You do not have permission to delete this rsvp.' });
        }
        await rsvpModel.delete(rsvp_id);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};