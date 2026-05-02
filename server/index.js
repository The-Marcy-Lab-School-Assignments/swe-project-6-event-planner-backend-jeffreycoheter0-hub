// ====================================
// Imports / Constants
// ====================================

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('dotenv').config(); // loads every variable into "process.env" before any code runs

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');
const authControllers = require('./controllers/authControllers');
const eventControllers = require('./controllers/eventControllers');
const rsvpControllers = require('./controllers/rsvpControllers');
const userControllers = require('./controllers/userControllers');


const app = express();
const PORT = process.env.PORT || 8080;

// Use dist (requires building the frontend) in production environment
const pathToFrontend = process.env.NODE_ENV === 'production' ? '../frontend/dist' : '../frontend';

// ====================================
// Middleware
// ====================================

app.use(logRoutes);
app.use(cookieSession({ name: 'session', secret: process.env.SESSION_SECRET })); // creates/parses cookie stored in req.session
app.use(express.json()); // parses requests and stores JSON data in req.body
app.use(express.static(path.join(__dirname, pathToFrontend)));

// ====================================
// Auth routes
// ====================================

app.post('/api/auth/register', authControllers.register);
app.post('/api/auth/login', authControllers.login);
app.get('/api/auth/me', authControllers.getMe);
app.delete('/api/auth/logout', authControllers.logout);

// ====================================
// Event routes
// ====================================

app.get('/api/events', eventControllers.listEvents);
app.post('/api/events', checkAuthentication, eventControllers.createEvent);
app.delete('/api/events/:event_id', checkAuthentication, eventControllers.deleteEvent);
app.patch('/api/events/:event_id', checkAuthentication, eventControllers.updateEvent);
app.get('/api/users/:user_id/events', eventControllers.listUserEvents);

// ====================================
// User routes
// ====================================

app.patch('/api/users/:user_id', checkAuthentication, userControllers.changePassword);
app.delete('/api/users/:user_id', checkAuthentication, userControllers.deleteUser);

// ====================================
// RSVP routes
// ====================================

app.post('/api/events/:event_id/rsvps', checkAuthentication, rsvpControllers.createRsvp);
app.delete('/api/events/:event_id/rsvps', checkAuthentication, rsvpControllers.deleteRsvp);
app.get('/api/users/:user_id/rsvps', rsvpControllers.listAllRsvp);


// ====================================
// Global Error Handling
// ====================================

// Notice that this error handler has **four** parameters.
const handleError = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
};
app.use(handleError);

// ====================================
// Listen
// ====================================

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));