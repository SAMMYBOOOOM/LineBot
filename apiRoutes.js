const express = require('express');
const router = express.Router();
// const path = require('path');
const queryAsync = require('./queryAsync');

// Get all users
router.get('/api/users', async (req, res) => {
    const sql = 'SELECT * FROM users';
    const result = await queryAsync(sql);
    res.json(result);
});

// Get a specific user
router.get('/api/users/:userId', async (req, res) => {
    const userId = req.params.userId;

    const sql = 'SELECT * FROM users WHERE user_id = ?';
    const result = await queryAsync(sql, [userId]);

    if (result.length === 0) {
        res.status(404).send('User not found');
        return;
    }

    res.json(result[0]);
});

// Update a user
router.put('/api/users/:userId', express.json(), async (req, res) => {
    const userId = req.params.userId;
    const {
        role_id
    } = req.body;

    // Check if the role_id is valid (either 1 or 2)
    if (role_id !== '1' && role_id !== '2') {
        res.status(400).send('Invalid role_id. It must be either 1 or 2.');
        return;
    }

    const sql = 'UPDATE users SET role_id = ? WHERE user_id = ?';
    await queryAsync(sql, [role_id, userId]);

    res.status(200).send('User role updated');
});

// Delete a user
router.delete('/api/users/:userId', async (req, res) => {
    const userId = req.params.userId;

    const sql = 'DELETE FROM users WHERE user_id = ?';
    await queryAsync(sql, [userId]);

    res.status(200).send('User deleted');
});

// Get all scores
router.get('/api/scores', async (req, res) => {
    const sql = 'SELECT * FROM scores';
    const result = await queryAsync(sql);
    res.json(result);
});

module.exports = router;