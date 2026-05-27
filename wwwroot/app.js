const apiUrl = 'https://localhost:7140/api/auth';


function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

function getClaimsFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function showAlert(message, type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

const apiTrainingUrl = 'https://localhost:7140/api/training'; // Adres do kontrolera treningów

async function loadPublicSchedule() {
    const scheduleBody = document.getElementById('publicScheduleBody');
    if (!scheduleBody) return;

    // Sprawdzamy rolę aktualnie zalogowanego użytkownika
    const claims = getClaimsFromToken();
    let userRole = null;
    if (claims) {
        userRole = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }

    try {
        const response = await fetch(apiTrainingUrl);

        if (response.ok) {
            const trainings = await response.json();
            scheduleBody.innerHTML = '';

            if (trainings.length === 0) {
                scheduleBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Brak zaplanowanych zajęć.</td></tr>';
                return;
            }

            trainings.forEach(t => {
                // Decydujemy, co pokazać w kolumnie "Akcje"
                let actionHtml = '';
                if (userRole === 'Uczestnik') {
                    // Przycisk tylko dla uczestników
                    actionHtml = `<button class="btn btn-sm btn-primary" onclick="bookTraining(${t.id})">Zapisz się</button>`;
                } else if (!userRole) {
                    // Informacja dla niezalogowanych
                    actionHtml = `<span class="text-muted small">Zaloguj się, by zapisać</span>`;
                }
                const safeName = escapeHTML(t.name);
                const safeTrainer = escapeHTML(t.trainerName);

                scheduleBody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-primary">${t.name}</td>
                        <td>👨‍🏫 ${t.trainerName}</td>
                        <td>📅 ${t.date}</td>
                        <td>⏰ ${t.time}</td>
                        <td><span class="badge bg-success rounded-pill">${t.capacity} miejsc</span></td>
                        <td>${actionHtml}</td> </tr>`;
            });
        } else {
            scheduleBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Nie udało się załadować grafiku.</td></tr>';
        }
    } catch (error) {
        scheduleBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Błąd połączenia z serwerem.</td></tr>';
    }
}


// Funkcja wysyłająca rezerwację do serwera
window.bookTraining = async (trainingId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('https://localhost:7140/api/reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ trainingId: trainingId })
        });

        if (response.ok) {
            showAlert('Pomyślnie zapisano na zajęcia!', 'success', 'indexAlerts');
            loadPublicSchedule(); 
        } else {
            const data = await response.json();
            showAlert(data.message || 'Błąd podczas zapisów.', 'danger', 'indexAlerts');
        }
    } catch (error) {
        showAlert('Błąd połączenia z serwerem.', 'danger', 'indexAlerts');
    }
};

function updateNavigation() {
    const claims = getClaimsFromToken();
    const guestLinks = document.getElementById('guest-links');
    const userLinks = document.getElementById('user-links');
    const userNameDisplay = document.getElementById('user-name-display');
    const adminPanelLink = document.getElementById('admin-panel-link');
    const trainerPanelLink = document.getElementById('trainer-panel-link');
    const participantPanelLink = document.getElementById('participant-panel-link'); 

    if (claims) {
        const userName = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const userRole = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if (guestLinks) { guestLinks.classList.remove('d-flex'); guestLinks.classList.add('d-none'); }
        if (userLinks) { userLinks.classList.remove('d-none'); userLinks.classList.add('d-flex'); }
        if (userNameDisplay) userNameDisplay.innerText = userName;

        // Obsługa widoczności Panelu Administratora
        if (adminPanelLink) {
            if (userRole === 'Administrator') {
                adminPanelLink.classList.remove('d-none');
            } else {
                adminPanelLink.classList.add('d-none');
            }
        }

        // Obsługa widoczności Panelu Trenera
        if (trainerPanelLink) {
            if (userRole === 'Trener') {
                trainerPanelLink.classList.remove('d-none');
            } else {
                trainerPanelLink.classList.add('d-none');
            }
        }

        // Pokazujemy panel tylko dla Uczestnika
        if (participantPanelLink) {
            if (userRole === 'Uczestnik') {
                participantPanelLink.classList.remove('d-none');
            } else {
                participantPanelLink.classList.add('d-none');
            }
        }

    } else {
        // Blok dla wylogowanego użytkownika (ukrywamy wszystkie panele)
        if (guestLinks) { guestLinks.classList.remove('d-none'); guestLinks.classList.add('d-flex'); }
        if (userLinks) { userLinks.classList.remove('d-flex'); userLinks.classList.add('d-none'); }
        if (adminPanelLink) adminPanelLink.classList.add('d-none');
        if (trainerPanelLink) trainerPanelLink.classList.add('d-none');
        if (participantPanelLink) participantPanelLink.classList.add('d-none'); 
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    loadPublicSchedule();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('regFirstName').value;
            const lastName = document.getElementById('regLastName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const btn = document.getElementById('regBtn');

            if (password !== confirmPassword) {
                showAlert('Hasła nie są identyczne.', 'warning', 'regAlerts');
                return;
            }

            btn.disabled = true;
            btn.innerHTML = 'Rejestrowanie...';

            try {
                const response = await fetch(`${apiUrl}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword 
                    })
                });

                btn.disabled = false;
                btn.innerHTML = 'Utwórz konto';

                if (response.ok) {
                    window.location.href = 'login.html?registered=true';
                } else {
                    const data = await response.json();


                    let errorMsg = data.message || 'Błąd rejestracji.';
                    if (data.errors) {
                        if (Array.isArray(data.errors)) {
                            errorMsg += '<br>' + data.errors.join('<br>');
                        } else {

                            for (let key in data.errors) {
                                errorMsg += '<br>' + data.errors[key].join('<br>');
                            }
                        }
                    }
                    showAlert(errorMsg, 'danger', 'regAlerts');
                }
            } catch (error) {

                btn.disabled = false;
                btn.innerHTML = 'Utwórz konto';
                showAlert('Błąd połączenia z serwerem. Upewnij się, że backend działa i port jest poprawny.', 'danger', 'regAlerts');
                console.error("Szczegóły błędu:", error);
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registered') === 'true') {
            showAlert('Konto utworzone. Możesz się zalogować.', 'success', 'logAlerts');
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('logEmail').value;
            const password = document.getElementById('logPassword').value;
            const btn = document.getElementById('logBtn');

            btn.disabled = true;
            btn.innerHTML = 'Logowanie...';

            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            btn.disabled = false;
            btn.innerHTML = 'Zaloguj';

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                // Odkodowanie tokena JWT, aby sprawdzić rolę
                const payload = JSON.parse(atob(data.token.split('.')[1]));

                // Klucz roli 
                const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
                const userRole = payload[roleKey];

                // przekierowanie
                if (userRole === "Administrator") {
                    window.location.href = 'admin.html';
                } else if (userRole === "Trener") {
                    window.location.href = 'trainer.html'; // Przenosi trenera do jego panelu
                } else {
                    window.location.href = 'index.html'; // Zwykły uczestnik
                }
            } else {
                const data = await response.json();
                showAlert(data.message || 'Błąd logowania.', 'danger', 'logAlerts');
            }
        });
    }
});