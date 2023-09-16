// Fetch all scores and display them in the table
async function fetchScores() {
    const response = await fetch('/api/scores');
    const scores = await response.json();
    const tbody = document.querySelector('#scores-table tbody');
    tbody.innerHTML = '';

    scores.forEach(score => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${score.user_id}</td>
            <td>${score.course_id}</td>
            <td>${score.score}</td>
        `;
        tbody.appendChild(tr);
    });
}

fetchScores();