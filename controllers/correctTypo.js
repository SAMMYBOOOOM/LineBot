const natural = require('natural');

function correctTypo(message) {
    const classifier = natural.SoundEx;
    const knownCommands = ['insertscore', 'insertcourse', 'viewscore', 'image', 'info'];

    const messageTokens = message.split(':');
    if (messageTokens.length === 2) {
        const command = messageTokens[0].toLowerCase().replace(/\s/g, ''); // Remove spaces from the command
        const correctedCommand = knownCommands.find((knownCommand) => classifier.compare(command, knownCommand) >= 0.8);
        if (correctedCommand) {
            console.log(`Corrected typo: ${messageTokens[0]} -> ${correctedCommand}`);
            return `${correctedCommand}:${messageTokens[1]}`;
        }
    }
    return message;
}

module.exports = correctTypo;