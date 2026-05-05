// Используем window, чтобы избежать ошибок переобъявления в консоли
    window.API_URL = 'http://127.0.0.1:8000';
    window.toiletsData = [];

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

        if (token && authControls && userControls) {
            authControls.classList.add('hidden');
            userControls.classList.remove('hidden');
            const usernameBox = document.getElementById('username-box');
            if (usernameBox) usernameBox.innerText = 'Пользователь';
        }
    }

    // 3. Получение списка туалетов
    async function fetchToilets() {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`${window.API_URL}/toilet/`, { headers });

            if (!response.ok) {
                throw new Error(`Сервер вернул ошибку ${response.status}. Проверьте URL в urls.py`);
            }

            window.toiletsData = await response.json();
            renderToilets(window.toiletsData);
        } catch (err) {
            console.error("Детали ошибки:", err);
            const list = document.getElementById('toilet-list');
            if (list) list.innerHTML = `<p class="text-red-500">Ошибка: ${err.message}</p>`;
        }
    }

    // 4. Отрисовка карточек
    function renderToilets(data) {
        const container = document.getElementById('toilet-list');
        if (!container) return;

        const now = new Date().getTime();

        container.innerHTML = data.map(item => {
            const isBusy = now < new Date(item.time_end).getTime();

            return `
                <div class="card ${isBusy ? 'busy' : 'free'} p-4 border rounded mb-2">
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
                        class="btn-primary w-full bg-blue-500 text-white p-2 rounded"
                        ${isBusy ? 'disabled' : ''}>
                        ${isBusy ? 'Мест нет' : 'Забронировать'}
                    </button>
                </div>
            `;
        }).join('');
    }

    // 5. Фильтрация
    window.applyFilters = function() {
        const level = document.getElementById('filter-level').value;
        const filterDateStr = document.getElementById('filter-date').value;

        const filtered = window.toiletsData.filter(t => {
            const matchLevel = (level === 'all' || t.level === level);

            let matchAvailable = true;
            if (filterDateStr) {
                const fTime = new Date(filterDateStr).getTime();
                const tEnd = new Date(t.time_end).getTime();
                matchAvailable = fTime > tEnd;
            }
            return matchLevel && matchAvailable;
        });

        renderToilets(filtered);
    };

    // 6. Работа с модальным окном
    window.openBooking = function(id) {
        if (!localStorage.getItem('token')) {
            alert("Пожалуйста, войдите в систему");
            return;
        }
        const idInput = document.getElementById('selected-toilet-id');
        const modal = document.getElementById('booking-modal');
        if (idInput) idInput.value = id;
        if (modal) modal.classList.remove('hidden');
    };

    window.closeModal = function() {
        const modal = document.getElementById('booking-modal');
        if (modal) modal.classList.add('hidden');
    };

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('selected-toilet-id').value;
            const cap = document.getElementById('room-capacity').value;

            try {
                const resp = await fetch(`${window.API_URL}/toilet_room/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ toilet: id, capacity: cap })
                });

                if (resp.ok) {
                    alert("Забронировано успешно!");
                    window.closeModal();
                    fetchToilets();
                } else {
                    alert("Ошибка при бронировании. Проверьте данные.");
                }
            } catch (err) {
                alert("Нет связи с сервером.");
            }
        };
    }

    window.logout = function() {
        localStorage.removeItem('token');
        location.reload();
    };