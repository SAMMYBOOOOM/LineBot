async function uploadRichMenuImage(client, richMenuId, imagePath) {
    const fs = require('fs');

    try {
        const buffer = fs.readFileSync(imagePath);
        await client.setRichMenuImage(richMenuId, buffer);
        console.log(`Rich menu image has been set: ${richMenuId}`);
    } catch (err) {
        console.error(`Failed to set rich menu image: ${err}`);
    }
}

async function createRichMenu(client, role) {
    // Define different rich menu templates for different roles
    const richMenuTemplates = {
        teacher: {
            size: {
                width: 2500,
                height: 843,
            },
            selected: false,
            name: 'Teacher Menu',
            chatBarText: 'Menu',
            areas: [{
                    bounds: {
                        x: 0,
                        y: 0,
                        width: 625,
                        height: 843,
                    },
                    action: {
                        type: 'message',
                        text: '[action 1]',
                    },
                },
                {
                    bounds: {
                        x: 625,
                        y: 0,
                        width: 625,
                        height: 843,
                    },
                    action: {
                        type: 'message',
                        text: '[action 2]',
                    },
                },
                {
                    bounds: {
                        x: 1250,
                        y: 0,
                        width: 625,
                        height: 843,
                    },
                    action: {
                        type: 'message',
                        text: '[action 3]',
                    },
                },
                {
                    bounds: {
                        x: 1875,
                        y: 0,
                        width: 625,
                        height: 843,
                    },
                    action: {
                        type: 'message',
                        text: '[action 4]',
                    },
                },
            ],
        },
        student: {
            size: {
                width: 2500,
                height: 843,
            },
            selected: false,
            name: 'Student Menu',
            chatBarText: 'Menu',
            areas: [{
                    bounds: {
                        x: 0,
                        y: 0,
                        width: 1250,
                        height: 843,
                    },
                    action: {
                        type: 'message',
                        text: '[action 1]',
                    },
                },
                {
                    bounds: {
                        x: 1250,
                        y: 0,
                        width: 1250,
                        height: 843,
                    },
                    action: {
                        type: 'message',
                        text: '[action 2]',
                    },
                },
            ],
        },
    };

    // Choose the rich menu template based on the user's role
    const richMenu = richMenuTemplates[role];

    try {
        const richMenuId = await client.createRichMenu(richMenu);
        console.log(`Rich menu created with ID: ${richMenuId}`);
        return richMenuId;
    } catch (err) {
        console.error(`Failed to create rich menu: ${err}`);
        return null;
    }
}

async function linkRichMenuToUser(client, richMenuId, userId) {
    try {
        await client.linkRichMenuToUser(userId, richMenuId);
        console.log(`Rich menu ${richMenuId} has been linked to user ${userId}`);
    } catch (err) {
        console.error(`Failed to link rich menu to user: ${err}`);
    }
}

async function unlinkRichMenuFromUser(client, userId) {
    try {
        await client.unlinkRichMenuFromUser(userId);
        console.log(`Rich menu has been unlinked from user ${userId}`);
    } catch (err) {
        console.error(`Failed to unlink rich menu from user: ${err}`);
    }
}

async function createAndLinkRichMenu(client, userId, role) {
    const richMenuId = await createRichMenu(client, role);
    if (richMenuId) {
        await uploadRichMenuImage(
            client,
            richMenuId,
            `./img/${role}Richmenu.png`
        );
        await linkRichMenuToUser(client, richMenuId, userId);
    }
}

module.exports = {
    createAndLinkRichMenu,
    unlinkRichMenuFromUser,
};