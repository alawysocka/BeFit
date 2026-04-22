const apiUrl = 'https://localhost:7140/api/auth';

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

function updateNavigation() {
    const claims = getClaimsFromToken();
    const guestLinks = document.getElementById('guest-links');
    const userLinks = document.getElementById('user-links');
    const userNameDisplay = document.getElementById('user-name-display');
    const adminPanelLink = document.getElementById('admin-panel-link');

    if (claims) {
        const userName = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const userRole = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if (guestLinks) { guestLinks.classList.remove('d-flex'); guestLinks.classList.add('d-none'); }
        if (userLinks) { userLinks.classList.remove('d-none'); userLinks.classList.add('d-flex'); }
        if (userNameDisplay) userNameDisplay.innerText = userName;

        if (adminPanelLink) {
            if (userRole === 'Administrator') {
                adminPanelLink.classList.remove('d-none');
            } else {
                adminPanelLink.classList.add('d-none');
            }
        }
    } else {
        if (guestLinks) { guestLinks.classList.remove('d-none'); guestLinks.classList.add('d-flex'); }
        if (userLinks) { userLinks.classList.remove('d-flex'); userLinks.classList.add('d-none'); }
        if (adminPanelLink) adminPanelLink.classList.add('d-none');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();

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
                window.location.href = 'index.html';
            } else {
                const data = await response.json();
                showAlert(data.message || 'Błąd logowania.', 'danger', 'logAlerts');
            }
        });
    }
});