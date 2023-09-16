'use strict';

require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
const mysql = require('mysql2');
const correctTypo = require('./controllers/correctTypo');
const handleCommand = require('./controllers/command');
const {
    createAndLinkRichMenu,
    unlinkRichMenuFromUser
} = require('./controllers/richmenu');
const createScoreImage = require('./controllers/createScoreImage');
const path = require('path');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create LINE SDK client
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

// create Express app
const app = express();

// http://localhost:3000/admin?password=1234
// Serve the admin page
app.get('/admin', (req, res) => {
    const password = req.query.password; // Retrieve the password from the query parameter
    const correctPassword = process.env.PASSWORD; // Retrieve the correct password from the .env file

    // Check if the password matches
    if (password !== correctPassword) {
        res.status(401).send('Unauthorized'); // Return Unauthorized status if the password is incorrect
        return;
    }

    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // Serve the admin.html file
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// register a webhook handler with middleware
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    let message = event.message.text;
    const lineId = event.source.userId;
    const userProfile = await client.getProfile(lineId);
    const userName = userProfile.displayName;
    console.log(`User ID: ${lineId}, User name: ${userName}, User message: ${message}`);

    // Check and correct user typos
    message = correctTypo(message);

    // Check if user exists
    const sqlSelectUser = 'SELECT * FROM users WHERE line_id = ?';
    const user = await queryAsync(sqlSelectUser, [lineId]);
    if (!user.length) {
        const sqlInsertUser = 'INSERT INTO users (user_name, line_id, role_id) VALUES (?, ?, 1)';
        await queryAsync(sqlInsertUser, [userName, lineId]);

        // Create the Rich Menu, upload the image, and link it to the user
        // await createAndLinkRichMenu(client, lineId);
    }

    const sqlUserId = 'SELECT u.user_id FROM users u WHERE line_id = ?';
    const uId = await queryAsync(sqlUserId, [lineId]);
    const userId = uId[0].user_id;

    const sqlUserRole = 'SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?';
    const userRole = await queryAsync(sqlUserRole, [userId]);
    const role = userRole[0].role_name;

    // Unlink the current rich menu from the user
    await unlinkRichMenuFromUser(client, lineId);

    // Create the Rich Menu, upload the image, and link it to the user
    await createAndLinkRichMenu(client, lineId, role);

    // Handle user commands
    let replyMessage = await handleCommand(message, userId, userName, role, client, queryAsync, createScoreImage);

    const sqlInsert = 'INSERT INTO messages (message, user_id) VALUES (?, ?)';
    connection.query(sqlInsert, [message, userId], (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('message stored in MySQL');
    });

    // return client.replyMessage(event.replyToken, echo);
    if (replyMessage.type === 'image') {
        // Reply with the image message
        return client.replyMessage(event.replyToken, replyMessage);
    } else {
        // Reply with the text message
        const echo = {
            type: 'text',
            text: replyMessage,
        };

        const sqlInsert2 = 'INSERT INTO messages (message, user_id) VALUES (?, ?)';
        connection.query(sqlInsert2, [replyMessage, userId], (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('reply message stored in MySQL');
        });

        return client.replyMessage(event.replyToken, echo);
    }
}

function queryAsync(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

app.get('/:imageFilename', (req, res) => {
    const imageFilename = req.params.imageFilename;
    const imagePath = path.join(__dirname, 'img', imageFilename);
    res.sendFile(imagePath);
});

const apiRoutes = require('./apiRoutes');
app.use(apiRoutes);

// start Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});