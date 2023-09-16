// Fetch all users and display them in the table
async function fetchUsers() {
    const response = await fetch('/api/users');
    const users = await response.json();
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.user_name}</td>
            <td>${user.role_id}</td>
            <td>
            <button class="btn btn-warning btn-sm" onclick="editUser(${user.user_id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.user_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Edit a user
async function editUser(userId) {
    console.log('Edit button clicked for user ID:', userId);
    const response = await fetch(`/api/users/${userId}`);

    if (response.status === 404) {
        console.error('User not found');
        return;
    }

    const user = await response.json();

    // Set the form values
    document.getElementById('edit-role-id').value = user.role_id;

    // Store the user ID in a data attribute
    document.getElementById('save-edit-user').dataset.userId = user.user_id;

    // Show the edit user modal
    $('#edit-user-modal').modal('show');
}

// Handle the Edit User form submission
document.getElementById('save-edit-user').addEventListener('click', async () => {
    const roleId = document.getElementById('edit-role-id').value;
    const userId = document.getElementById('save-edit-user').dataset.userId;

    // Check if the roleId is valid (either 1 or 2)
    if (roleId !== '1' && roleId !== '2') {
        console.error('Invalid role_id. It must be either 1 or 2.');
        return;
    }

    const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            role_id: roleId,
        }),
    });

    if (response.status === 200) {
        fetchUsers();
        // Close the modal
        $('#edit-user-modal').modal('hide');
    } else {
        console.error('Failed to edit user');
    }
});

// Delete a user
async function deleteUser(userId) {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
    });

    if (response.status === 200) {
        fetchUsers();
    } else {
        console.error('Failed to delete user');
    }
}

fetchUsers();