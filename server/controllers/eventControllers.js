const eventModel = require('../models/eventModel');

module.exports.listEvents = async (req, res, next) => {
    try {
        const events = await eventModel.list();
        res.send(events);
    } catch (err) {
        next(err);
    }
};

module.exports.listUserEvents = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const events = await eventModel.listByUser(user_id);
        res.send(events);
    } catch (err) {
        next(err);
    }
};

module.exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, date, location, event_type, max_capacity } = req.body;
        if (!title || !date || !location || !event_type || !max_capacity) {
            return res.status(400).send({ error: 'Title, Date, Location, Event type and Max capacity are required.' });
        }
        const event = await eventModel.create(title, description, date, location, event_type, max_capacity, req.session.user_id);
        res.status(201).send(event);
    } catch (err) {
        next(err);
    }
};

module.exports.updateEvent = async (req, res, next) => {
    try {
        const { title, date } = req.params;
        const updatedEvent = await eventModel.update(title, date, req.session.user_id);
        if (!updatedEvent) return res.status(200).send(true);
        res.status(201).send(true);
    } catch (err) {
        next(err);
    }
};

module.exports.deleteEvent = async (req, res, next) => {
    try {
        const { event_id } = req.params;
        const event = await eventModel.find(event_id);
        if (!event) return res.status(400).send({ error: 'Event not found.' });
        if (event.user_id !== req.session.user_id) {
            return res.status(403).send({ error: 'You do not have permission to delete this event.' });
        }
        await eventModel.delete(event_id);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};