const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

module.exports.changePassword = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { password } = req.body;

        if (!req.session.user_id) {
            return res.status(401).send({ error: 'User is not logged in.' });
        }
        if (parseInt(user_id) !== req.session.user_id) {
            return res.status(403).send({ error: 'You do not have permission to this user.' });
        }
        if (!password) {
            return res.status(400).send({ error: 'Missing password' });
        }
        const user = await userModel.find(user_id);
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await userModel.updatePassword(user_id, hashedPassword);
        res.status(200).send({
            user_id: user.user_id,
            username: user.username
        });
    } catch (err) {
        next(err);
    }
};

module.exports.deleteUser = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const user = await userModel.find(user_id);
        if (!user) return res.status(404).send({ error: 'User not found.' });
        if (user.user_id !== req.session.user_id) {
            return res.status(403).send({ error: 'You do not have permission to delete this user.' });
        }
        await userModel.delete(user_id);
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};