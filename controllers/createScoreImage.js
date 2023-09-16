const fs = require('fs');
const {
    createCanvas
} = require('canvas');

async function createScoreImage(scores, filename) {
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Define table styles
    const tableX = 20;
    const tableY = 40;
    const columnWidth = 120;
    const rowHeight = 30;
    const headerBackgroundColor = '#f2f2f2';
    const headerTextColor = '#000000';
    const rowBackgroundColor = '#ffffff';
    const rowAltBackgroundColor = '#f2f2f2'; // Alternate row background color
    const rowTextColor = '#000000';
    const headerFont = 'bold 16px Arial';
    const rowFont = '16px Arial';

    // Draw table header
    ctx.fillStyle = headerBackgroundColor;
    ctx.fillRect(tableX, tableY, columnWidth, rowHeight);
    ctx.fillRect(tableX + columnWidth, tableY, columnWidth, rowHeight);
    ctx.fillStyle = headerTextColor;
    ctx.font = headerFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Course ID', tableX + columnWidth / 2, tableY + rowHeight / 2);
    ctx.fillText('Score', tableX + 1.5 * columnWidth, tableY + rowHeight / 2);

    // Draw table rows
    let yOffset = tableY + rowHeight;
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        const isEvenRow = i % 2 === 0;
        const rowFillStyle = isEvenRow ? rowBackgroundColor : rowAltBackgroundColor;

        // Draw row background
        ctx.fillStyle = rowFillStyle;
        ctx.fillRect(tableX, yOffset, 2 * columnWidth, rowHeight);

        // Draw row text
        ctx.fillStyle = rowTextColor;
        ctx.font = rowFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(score.course_id.toString(), tableX + columnWidth / 2, yOffset + rowHeight / 2);
        ctx.fillText(score.score.toString(), tableX + 1.5 * columnWidth, yOffset + rowHeight / 2);

        // Draw row separator (horizontal line)
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tableX, yOffset + rowHeight);
        ctx.lineTo(tableX + 2 * columnWidth, yOffset + rowHeight);
        ctx.stroke();

        yOffset += rowHeight;
    }

    // Draw table borders
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, tableY, columnWidth, yOffset - tableY);
    ctx.strokeRect(tableX + columnWidth, tableY, columnWidth, yOffset - tableY);

    // Draw final row separator (horizontal line)
    ctx.beginPath();
    ctx.moveTo(tableX, yOffset);
    ctx.lineTo(tableX + 2 * columnWidth, yOffset);
    ctx.stroke();

    // Draw vertical lines
    ctx.beginPath();
    ctx.moveTo(tableX + columnWidth, tableY);
    ctx.lineTo(tableX + columnWidth, yOffset);
    ctx.moveTo(tableX + 2 * columnWidth, tableY);
    ctx.lineTo(tableX + 2 * columnWidth, yOffset);
    ctx.stroke();

    // Save the image
    const imgPath = `./img/${filename}`;

    if (!fs.existsSync('./img')) {
        fs.mkdirSync('./img');
    }

    const out = fs.createWriteStream(imgPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`PNG image saved at ${imgPath}`));
}

module.exports = createScoreImage;