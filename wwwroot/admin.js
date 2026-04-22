const apiAdminUrl = 'https://localhost:7140/api/admin';

function showAdminAlert(message, type) {
    const container = document.getElementById('adminAlerts');
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

async function loadWhitelist() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiAdminUrl}/whitelist`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        const trainers = await response.json();
        const tbody = document.getElementById('whitelistBody');
        tbody.innerHTML = '';

        if (trainers.length === 0) {
            tbody.innerHTML = '<tr><td class="text-muted text-center">Brak autoryzowanych trenerów.</td></tr>';
            return;
        }

        trainers.forEach(t => {
            tbody.innerHTML += `<tr><td>${t.email}</td></tr>`;
        });
    }
}

document.getElementById('addTrainerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newTrainerEmail');
    const btn = document.getElementById('addTrainerBtn');
    const token = localStorage.getItem('token');

    btn.disabled = true;

    const response = await fetch(`${apiAdminUrl}/whitelist`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: emailInput.value })
    });

    btn.disabled = false;

    if (response.ok) {
        emailInput.value = '';
        showAdminAlert('Adres e-mail został dodany do listy.', 'success');
        loadWhitelist();
    } else {
        const data = await response.json();
        showAdminAlert(data.message || 'Wystąpił błąd podczas dodawania.', 'danger');
    }
});

document.addEventListener('DOMContentLoaded', loadWhitelist);