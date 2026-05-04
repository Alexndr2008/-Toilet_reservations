const API_URL = 'http://127.0.0.0:8000'; // Укажи свой URL Django
let toiletsData = [];

// 1. Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchToilets();
});

// 2. Проверка токена
function checkAuth() {
    const token = localStorage.getItem('token');
    const authControls = document.getElementById('auth-controls');
    const userControls = document.getElementById('user-controls');

    if (token) {
        authControls.classList.add('hidden');
        userControls.classList.remove('hidden');
        document.getElementById('username-box').innerText = 'Пользователь';
    }
}

// 3. Получение списка туалетов
async function fetchToilets() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${API_URL}/toilet/`, { headers });
        toiletsData = await response.json();
        renderToilets(toiletsData);
    } catch (err) {
        console.error("Ошибка сети:", err);
        document.getElementById('toilet-list').innerHTML = "Ошибка подключения к API";
    }
}

// 4. Отрисовка карточек
function renderToilets(data) {
    const container = document.getElementById('toilet-list');
    const now = new Date().getTime();

    container.innerHTML = data.map(item => {
        const isBusy = now < new Date(item.time_end).getTime();

        return `
            <div class="card ${isBusy ? 'busy' : 'free'}">
                <div class="flex justify-between mb-2">
                    <h3 class="font-bold text-lg">${item.title}</h3>
                    <span class="status-badge ${isBusy ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
                        ${isBusy ? 'ЗАНЯТ' : 'СВОБОДЕН'}
                    </span>
                </div>
                <p class="text-indigo-600 text-sm font-semibold mb-1">${item.level}</p>
                <p class="text-gray-400 text-xs mb-4">Доступен до: ${new Date(item.time_end).toLocaleString()}</p>

                <button
                    onclick="openBooking(${item.id})"
                    class="btn-primary w-full"
                    ${isBusy ? 'disabled' : ''}>
                    ${isBusy ? 'Мест нет' : 'Забронировать'}
                </button>
            </div>
        `;
    }).join('');
}

// 5. Фильтрация на клиенте
function applyFilters() {
    const level = document.getElementById('filter-level').value;
    const filterDateStr = document.getElementById('filter-date').value;

    const filtered = toiletsData.filter(t => {
        const matchLevel = (level === 'all' || t.level === level);

        let matchAvailable = true;
        if (filterDateStr) {
            const fTime = new Date(filterDateStr).getTime();
            const tEnd = new Date(t.time_end).getTime();
            matchAvailable = fTime > tEnd; // Свободен, если выбранное время после окончания текущей брони
        }

        return matchLevel && matchAvailable;
    });

    renderToilets(filtered);
}

// 6. Работа с модальным окном и API бронирования
function openBooking(id) {
    if (!localStorage.getItem('token')) {
        alert("Пожалуйста, войдите в систему");
        return;
    }
    document.getElementById('selected-toilet-id').value = id;
    document.getElementById('booking-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('booking-modal').classList.add('hidden');
}

document.getElementById('booking-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('selected-toilet-id').value;
    const cap = document.getElementById('room-capacity').value;

    const resp = await fetch(`${API_URL}/toilet_room/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ toilet: id, capacity: cap })
    });

    if (resp.ok) {
        alert("Забронировано успешно!");
        closeModal();
        fetchToilets(); // Обновляем список
    } else {
        alert("Ошибка при бронировании");
    }
};

function logout() {
    localStorage.removeItem('token');
    location.reload();
}
