const line = require('@line/bot-sdk');
const path = require('path');

module.exports = async function handleCommand(message, userId, userName, role, client, queryAsync, createScoreImage) {
    let replyMessage;

    if (message.startsWith('insertscore:')) {
        if (role === 'teacher') {
            const scoresToInsert = message.split(':')[1].split(';').map(str => str.trim().split(','));
            let successfulInsertions = 0;
            let failedInsertions = 0;

            for (const [studentId, courseId, score] of scoresToInsert) {
                const sqlCheckStudent = 'SELECT * FROM users WHERE user_id = ? AND role_id != 2';
                const isStudent = await queryAsync(sqlCheckStudent, [studentId]);

                if (isStudent.length > 0) {
                    const sqlCheckScore = 'SELECT * FROM scores WHERE user_id = ? AND course_id = ?';
                    const scoreExisted = await queryAsync(sqlCheckScore, [studentId, courseId]);

                    if (scoreExisted.length) {
                        // Score already exists, update it instead of inserting a new row
                        const sqlUpdateScore = 'UPDATE scores SET score = ? WHERE user_id = ? AND course_id = ?';
                        await queryAsync(sqlUpdateScore, [score, studentId, courseId]);
                    } else {
                        // Score doesn't exist, insert a new row
                        const sqlInsertScore = 'INSERT INTO scores (user_id, course_id, score) VALUES (?, ?, ?)';
                        await queryAsync(sqlInsertScore, [studentId, courseId, score]);
                    }
                    successfulInsertions++;
                } else {
                    failedInsertions++;
                }
            }
            replyMessage = `Successfully inserted/updated ${successfulInsertions} scores. Failed to insert ${failedInsertions} scores (possible teacher or invalid user).`;
        } else {
            replyMessage = "You do not have permission to insert scores. Use 'viewscore:STUDENT_ID' to view your score.";
        }
    } else if (message.startsWith('viewscore:')) {
        const studentId = message.split(':')[1].trim();
        if (role === 'teacher' || (role === 'student' && parseInt(userId) === parseInt(studentId))) {
            const sqlSelect = 'SELECT s.course_id, s.score FROM scores s WHERE s.user_id = ?';
            const result = await queryAsync(sqlSelect, [studentId]);

            if (result.length > 0) {
                // Found the student's scores
                const scoreList = result.map(row => `Course ${row.course_id}: ${row.score}`).join(', ');
                replyMessage = `Score for student ${studentId}: ${scoreList}`;
            } else {
                // No matching student found
                replyMessage = `No score found for student ${studentId}.`;
            }
        } else {
            replyMessage = 'You do not have permission to view this score.';
            console.log(userId, studentId);
        }
    } else if (message.startsWith('image:')) {
        const studentId = message.split(':')[1].trim();
        if (role === 'teacher' || (role === 'student' && (studentId === '' || parseInt(userId) === parseInt(studentId)))) {
            const targetId = role === 'teacher' && studentId !== '' ? studentId : userId;
            const sqlSelect = 'SELECT s.course_id, s.score FROM scores s WHERE s.user_id = ?';
            const result = await queryAsync(sqlSelect, [targetId]);

            if (result.length > 0) {
                // Found the student's scores
                const scoreList = result.map(row => `Course ${row.course_id}: ${row.score}`).join(', ');
                replyMessage = `Score for student ${targetId}: ${scoreList}`;

                // Generate the score table image
                const imageFilename = `${targetId}Score.png`;

                // Call the createScoreImage function
                await createScoreImage(result, imageFilename);

                // Create the image message
                const ngrokLink = process.env.NGROK_LINK;
                const imageUrl = `${ngrokLink}/${imageFilename}`;
                const imageMessage = {
                    type: 'image',
                    // originalContentUrl: path.join(__dirname, `../img/${targetId}Score.png`),
                    // previewImageUrl: path.join(__dirname, `../img/${targetId}Score.png`)
                    originalContentUrl: imageUrl,
                    previewImageUrl: imageUrl
                };

                // Return the image message
                return imageMessage;
            } else {
                // No matching student found
                replyMessage = `No score found for student ${targetId}.`;
            }
        } else {
            replyMessage = 'You do not have permission to view this score.';
            console.log(userId, studentId);
        }
    } else if (message.startsWith('insertcourse:')) {
        if (role === 'teacher') {
            // insertcourse:3, A; 4, B
            const coursesToInsert = message.split(':')[1].split(';').map(str => str.trim().split(',').map(course => course.trim()));
            let successfulInsertions = 0;
            let failedInsertions = 0;

            for (const [courseId, courseName] of coursesToInsert) {
                // Check if the course already exists in the courses table
                const sqlSelectCourse = 'SELECT * FROM courses WHERE course_id = ?';
                const course = await queryAsync(sqlSelectCourse, [courseId]);

                if (course.length) {
                    // Course already exists, update its name
                    const sqlUpdateCourse = 'UPDATE courses SET course_name = ? WHERE course_id = ?';
                    await queryAsync(sqlUpdateCourse, [courseName, courseId]);
                } else {
                    // Course doesn't exist, insert a new row
                    const sqlInsertCourse = 'INSERT INTO courses (course_id, course_name) VALUES (?, ?)';
                    await queryAsync(sqlInsertCourse, [courseId, courseName]);
                }
                successfulInsertions++;
            }
            replyMessage = `Successfully inserted/updated ${successfulInsertions} courses. Failed to insert ${failedInsertions} courses (possibly due to duplicates or invalid entries).`;
        } else {
            replyMessage = "You do not have permission to insert courses. Use 'viewscore:STUDENT_ID' to view your score.";
        }

    } else if (message.startsWith('info:')) {
        const sqlSelectUserDetails = 'SELECT u.user_id, u.user_name, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?';
        const userDetails = await queryAsync(sqlSelectUserDetails, [userId]);
        const userInfo = userDetails[0];
        replyMessage = `User ID: ${userInfo.user_id}, User name: ${userInfo.user_name}, Role: ${userInfo.role_name}`;
    } else {
        if (role === 'teacher') {
            replyMessage = `Invalid command. You said: ${message}. Use 'insertscore:STUDENT_ID,COURSE_ID,SCORE', 'viewscore:STUDENT_ID', or 'insertcourse:COURSE_ID,COURSE_NAME' to get information. type 'info:' for more information`;
        } else {
            replyMessage = `Invalid command. You said: ${message}. Use 'viewscore:STUDENT_ID' to view your score. type 'info:' for more information`;
        }
    }

    return replyMessage;
};