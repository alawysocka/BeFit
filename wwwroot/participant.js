const apiReservationUrl = 'https://localhost:7140/api/reservation';

// 1. Sprawdzenie logowania
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
} else {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('userEmailDisplay').innerText = payload.email || 'Uczestnik';
    } catch (e) {
        console.error("Błąd tokena");
    }
}

// Obsługa wylogowania
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

function showAlert(message, type) {
    const container = document.getElementById('participantAlerts');
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// 2. Pobieranie rezerwacji z serwera
async function loadMyReservations() {
    const tbody = document.getElementById('myReservationsBody');

    try {
        const response = await fetch(`${apiReservationUrl}/myreservations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const reservations = await response.json();
            tbody.innerHTML = '';

            if (reservations.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nie jesteś zapisany na żadne zajęcia.</td></tr>';
                return;
            }

            reservations.forEach(r => {
                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold">${r.trainingName}</td>
                        <td>${r.trainerName}</td>
                        <td>${r.date}</td>
                        <td>${r.time}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelReservation(${r.reservationId})">Zrezygnuj</button>
                        </td>
                    </tr>`;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Błąd ładowania danych.</td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Błąd połączenia z serwerem.</td></tr>';
    }
}

// 3. Usuwanie rezerwacji (Rezygnacja)
window.cancelReservation = async (reservationId) => {
    if (!confirm('Czy na pewno chcesz zrezygnować z tych zajęć?')) return;

    try {
        const response = await fetch(`${apiReservationUrl}/${reservationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showAlert('Pomyślnie zrezygnowano z zajęć. Miejsce wróciło do puli.', 'success');
            loadMyReservations(); // Odświeżenie tabeli
        } else {
            const data = await response.json();
            showAlert(data.message || 'Błąd podczas rezygnacji.', 'danger');
        }
    } catch (error) {
        showAlert('Błąd połączenia z serwerem.', 'danger');
    }
};

// Start
document.addEventListener('DOMContentLoaded', loadMyReservations);