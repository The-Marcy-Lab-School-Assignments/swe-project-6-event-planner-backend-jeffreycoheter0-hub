const userModel = require('../models/userModel');

/*
This function handles user registration. It first extracts the username and password from the request body(deconstruct).
If either is missing, it returns a 400 error(bad request). It then checks if the username already exists in the database,
and if so, returns another 400 error. If the username is available, it creates a new "user" in the database and
stores the user’s ID in the session to log them in. Finally, it returns the created user with a 201 status.
*/
module.exports.register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ error: 'Username and password are required.' });
        }

        const existingUser = await userModel.findByUsername(username);
        if (existingUser) {
            return res.status(400).send({ error: 'Username already taken.' });
        }

        const user = await userModel.create(username, password);
        req.session.user_id = user.user_id;
        res.status(201).send(user);
    } catch (err) { // passes errors to Express error middleware
        next(err);
    }
};

/*
This function handles user login. It extracts the username and password from the request body,
then checks if they match a user in the database using validatePassword. If the credentials are invalid,
it returns a 401 Unauthorized error. If valid, it stores the user’s ID in the session to log them in,
and then sends back the user data in the response.
*/
module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await userModel.validatePassword(username, password);
        if (!user) return res.status(401).send({ error: 'Invalid credentials.' });
        req.session.user_id = user.user_id;
        res.send(user); // intentional flaw: user includes password_hash
    } catch (err) {
        next(err);
    }
};

/*
This function retrieves the currently logged-in user. It first checks if a user_id exists in the session;
if not, it returns a 401 Unauthorized response. If the user is authenticated,
it uses the user_id from the session to query the database and retrieve the user,
then sends that user in the response.
*/
module.exports.getMe = async (req, res, next) => {
    try {
        if (!req.session.user_id) return res.sendStatus(401);
        const user = await userModel.find(req.session.user_id);
        res.send(user);
    } catch (err) {
        next(err);
    }
};

/*
This function logs the user out by clearing the session data (req.session = null),
effectively removing their authentication. It then returns a 204 No Content response to
indicate the logout was successful without sending any data back.
*/
module.exports.logout = (req, res) => {
    req.session = null;
    res.sendStatus(204);
};