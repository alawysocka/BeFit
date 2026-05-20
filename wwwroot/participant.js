const apiReservationUrl = 'https://localhost:7140/api/reservation';


function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

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
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// 2. Pobieranie rezerwacji z serwera
async function loadMyReservations() {
    const tbody = document.getElementById('myReservationsBody');
    if (!tbody) return;

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
            const safeName = escapeHTML(r.trainingName);
            const safeTrainer = escapeHTML(r.trainerName);

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

// Start i logika Google Calendar
document.addEventListener('DOMContentLoaded', () => {
    loadMyReservations();

    // Obsługa komunikatu po powrocie z autoryzacji Google
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar') === 'success') {
        showAlert('Konto Google zostało pomyślnie połączone!', 'success');
        window.history.replaceState({}, document.title, window.location.pathname); // Ukrycie parametru z paska
    }

    // Podpięcie przycisku do autoryzacji
    const connectCalendarBtn = document.getElementById('connectCalendarBtn');
    if (connectCalendarBtn) {
        connectCalendarBtn.addEventListener('click', () => {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Odczytanie ID użytkownika (NameIdentifier)
                const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

                if (userId) {
                    window.location.href = `https://localhost:7140/api/calendar/connect?userId=${userId}`;
                } else {
                    showAlert('Nie udało się odczytać identyfikatora użytkownika.', 'danger');
                }
            } catch (e) {
                showAlert('Błąd przetwarzania tokena.', 'danger');
            }
        });
    }
});