const userModel = require('../models/userModel');

module.exports.findUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await userModel.findByUsername(username);
        res.send(user);
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
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};