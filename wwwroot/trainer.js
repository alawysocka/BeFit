const apiTrainingUrl = 'https://localhost:7140/api/training'; 

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('trainerEmailDisplay').innerText = payload.email || 'Trener';
} catch (e) {
    console.error("Błąd parsowania tokena");
}

function showAlert(message, type) {
    const container = document.getElementById('trainerAlerts');
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

async function loadMyTrainings() {
    try {
        const response = await fetch(`${apiTrainingUrl}/mytrainings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tbody = document.getElementById('myTrainingsBody');

        if (response.ok) {
            const trainings = await response.json();
            tbody.innerHTML = '';

            if (trainings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Brak zaplanowanych zajęć.</td></tr>';
                return;
            }

            trainings.forEach(t => {
                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold">${t.name}</td>
                        <td>${t.date}</td>
                        <td>${t.time}</td>
                        <td>${t.capacity}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${t.id}, ${t.capacity})">Edytuj</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTraining(${t.id})">Usuń</button>
                        </td>
                    </tr>`;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Błąd podczas pobierania danych.</td></tr>';
        }
    } catch (error) {
        console.error("Błąd:", error);
    }
}

document.getElementById('addTrainingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('addBtn');
    btn.disabled = true;

 
    const newTraining = {
        name: document.getElementById('trainingName').value,
        date: document.getElementById('trainingDate').value,
        time: document.getElementById('trainingTime').value + ":00",
        capacity: parseInt(document.getElementById('trainingCapacity').value)
    };

    try {
        const response = await fetch(apiTrainingUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newTraining)
        });

        if (response.ok) {
            showAlert('Zajęcia zostały pomyślnie dodane!', 'success');
            document.getElementById('addTrainingForm').reset();
            loadMyTrainings();
        } else {
            const data = await response.json();
            showAlert(data.message || 'Wystąpił błąd podczas dodawania.', 'danger');
        }
    } catch (error) {
        showAlert('Błąd połączenia z serwerem.', 'danger');
    } finally {
        btn.disabled = false;
    }
});



document.addEventListener('DOMContentLoaded', loadMyTrainings);


window.deleteTraining = async (id) => {
    if (!confirm('Czy na pewno chcesz odwołać i usunąć te zajęcia?')) return;

    try {
        const response = await fetch(`${apiTrainingUrl}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showAlert('Zajęcia zostały usunięte.', 'success');
            loadMyTrainings(); 
        } else {
            const data = await response.json();
            showAlert(data.message || 'Błąd podczas usuwania.', 'danger');
        }
    } catch (error) {
        showAlert('Błąd połączenia z serwerem.', 'danger');
    }
};

// Edytownie
let editModal;

window.openEditModal = (id, currentCapacity) => {
    document.getElementById('editTrainingId').value = id;
    document.getElementById('editTrainingCapacity').value = currentCapacity;

  
    editModal = new bootstrap.Modal(document.getElementById('editCapacityModal'));
    editModal.show();
};

document.getElementById('saveCapacityBtn').addEventListener('click', async () => {
    const id = document.getElementById('editTrainingId').value;
    const newCapacity = parseInt(document.getElementById('editTrainingCapacity').value);
    const btn = document.getElementById('saveCapacityBtn');

    btn.disabled = true;

    try {
        const response = await fetch(`${apiTrainingUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ capacity: newCapacity })
        });

        if (response.ok) {
            editModal.hide(); 
            showAlert('Pomyślnie zaktualizowano limit miejsc.', 'success');
            loadMyTrainings(); 
        } else {
            const data = await response.json();
            alert(data.message || 'Błąd edycji.'); 
        }
    } catch (error) {
        alert('Błąd połączenia z serwerem.');
    } finally {
        btn.disabled = false;
    }
});