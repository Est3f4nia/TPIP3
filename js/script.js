import { User } from './classes/User.js';
import { Room } from './classes/Room.js';
import { Reservation } from './classes/Reservation.js';

const API_USERS = 'https://691d039cd58e64bf0d34b8a1.mockapi.io/users/users';
const API_ROOMS = 'https://691d039cd58e64bf0d34b8a1.mockapi.io/users/rooms';
const API_RESERVATIONS = 'https://691484693746c71fe0488f7d.mockapi.io/api/reservations/reservations';

let habitaciones = [];
let reservas = [];
let usuarioActual = null;

/* ================================ */
/* MODALES & UTILIDADES */
/* ================================ */

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

function mostrarAlerta(mensaje, tipo = 'info') {
    const alertContainer = document.querySelector('.alertContainer') || document.body;

    const alert = document.createElement('div');
    alert.className = alert alert-${tipo};
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    alertContainer.insertBefore(alert, alertContainer.firstChild);

    setTimeout(() => alert.remove(), 5000);
}

/* ================================ */
/* TOGGLE LOGIN / REGISTRO */
/* ================================ */

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

/* ================================ */
/* VISTAS */
/* ================================ */

function mostrarVistaLogin() {
    document.getElementById('authView').style.display = 'flex';
    document.getElementById('appView').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
}

function mostrarVistaPrincipal() {
    document.getElementById('authView').style.display = 'none';
    document.getElementById('appView').style.display = 'block';
    document.getElementById('userInfo').style.display = 'flex';

    document.getElementById('userName').textContent = usuarioActual.nombre;
    document.getElementById('userRole').textContent = usuarioActual.role;

    if (usuarioActual.role === 'ADMIN') {
        document.getElementById('dashboardView').style.display = 'block';
        document.getElementById('roomsView').style.display = 'none';
        document.getElementById('reservationsView').style.display = 'none';
        // Inicializar acciones de Admin y cargar datos
        initAdminDashboard();
        actualizarEstadisticasDirecto();
    } else {
        document.getElementById('dashboardView').style.display = 'none';
        document.getElementById('roomsView').style.display = 'block';
        document.getElementById('reservationsView').style.display = 'none';
        // Usuario normal ve habitaciones
        cargarHabitaciones();
    }
}

// Función para vista de habitaciones de usuario normal
function verHabitaciones() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'block';
    cargarHabitaciones();
}

// Función para vista de reservas de usuario normal
function verReservas() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'block';
    // Resetear el botón si venía de admin
    const backBtn = document.getElementById('btnUserHabitaciones');
    if (backBtn) {
        backBtn.textContent = 'Ver habitaciones';
        backBtn.onclick = verHabitaciones;
    }
    cargarReservas();
}

/* ================================ */
/* GLOBALIZACIÓN DE FUNCIONES */
/* ================================ */

window.toggleAuthForm = toggleAuthForm;
window.cerrarSesion = cerrarSesion;
window.manejarLogin = manejarLogin;
window.crearUsuario = crearUsuario;
window.openModal = openModal;
window.closeModal = closeModal;
window.verHabitaciones = verHabitaciones; // Para usuario normal
window.verReservas = verReservas; // Para usuario normal

/* ================================ */
/* INICIO Y LISTENERS */
/* ================================ */

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');

    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarVistaPrincipal();
    } else {
        mostrarVistaLogin();
    }

    // Listeners principales
    document.getElementById('loginForm').addEventListener('submit', manejarLogin);
    document.getElementById('registerForm').addEventListener('submit', crearUsuario);
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    document.getElementById('reservationForm').addEventListener('submit', crearReserva);
    document.getElementById('btnVerReservas').addEventListener('click', verReservas);

    // Listener del botón de navegación (funciona para user: ver habitaciones, admin: volver al dashboard)
    const btnUserHabitaciones = document.getElementById('btnUserHabitaciones');
    if (btnUserHabitaciones) {
        btnUserHabitaciones.addEventListener('click', () => {
            if (usuarioActual && usuarioActual.role === 'ADMIN') {
                // Si es admin, es el botón de "Volver al Dashboard"
                document.getElementById('reservationsView').style.display = 'none';
                document.getElementById('roomsView').style.display = 'none';
                document.getElementById('dashboardView').style.display = 'block';
                actualizarEstadisticasDirecto();
            } else {
                verHabitaciones();
            }
        });
    }

    const roomForm = document.getElementById('roomForm');
    if (roomForm) {
        roomForm.addEventListener('submit', handleCreateRoom);
    }
});

/* ================================ */
/* LOGIN & REGISTRO */
/* ================================ */

async function manejarLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(API_USERS);
        if (!response.ok) throw new Error("Error al obtener usuarios.");

        const users = await response.json();
        const usuario = users.find(u => u.email === email);

        if (!usuario) {
            mostrarAlerta('Email no encontrado', 'error');
            return;
        }
        if (usuario.password !== password) {
            mostrarAlerta('Contraseña incorrecta', 'error');
            return;
        }

        usuarioActual = new User(usuario.id, usuario.nombre, usuario.email, '', usuario.role);
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));

        document.getElementById('loginForm').reset();
        mostrarVistaPrincipal();

        mostrarAlerta(Bienvenido ${usuario.nombre}, 'success');
    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al conectar con el servidor', 'error');
    }
}

async function crearUsuario(e) {
    e.preventDefault();

    const nombre = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const userData = { nombre, email, password, role: 'USUARIO' };

    try {
        const allRes = await fetch(API_USERS);
        const allUsers = await allRes.json();

        if (allUsers.some(u => u.email === email)) {
            mostrarAlerta('El email ya está registrado', 'error');
            return;
        }

        const response = await fetch(API_USERS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error(Error: ${response.status});

        mostrarAlerta('Registro exitoso. Inicia sesión.', 'success');
        document.getElementById('registerForm').reset();
        toggleAuthForm();

    } catch (err) {
        console.error('Error al registrar:', err);
        mostrarAlerta('Error al registrar usuario', 'error');
    }
}

function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuarioActual');

    document.getElementById('loginForm')?.reset();

    mostrarVistaLogin();
    mostrarAlerta('Sesión cerrada correctamente', 'success');
}

/* ================================ */
/* HABITACIONES */
/* ================================ */

async function cargarHabitaciones() {
    try {
        const response = await fetch(API_ROOMS);
        if (!response.ok) throw new Error('Error en fetch');

        habitaciones = await response.json();
        habitaciones = habitaciones.map(r => new Room(r.id, r.tipo, r.precio, r.disponible));

        // Cargar reservas aquí para tener los datos de solapamiento
        await cargarReservasParaValidacion();

        mostrarHabitaciones();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar habitaciones', 'error');
    }
}

async function cargarReservasParaValidacion() {
    try {
        const response = await fetch(API_RESERVATIONS);
        if (!response.ok) throw new Error('Error en fetch');

        const data = await response.json();
        reservas = data.map(r => new Reservation(r.id, r.userId, r.roomId, r.checkIn, r.checkOut, r.estado));

    } catch (error) {
        console.error('Error al cargar reservas para validación:', error);
    }
}

function mostrarHabitaciones() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (habitaciones.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No hay habitaciones</p>';
        return;
    }

    habitaciones.forEach(room => {
        // En la vista de usuario, solo se muestran las que están marcadas como disponibles.
        // Esto simplifica la UI para el usuario final, aunque la validación de solapamiento se hace en crearReserva
        if (!room.disponible) return;

        const card = document.createElement('div');
        card.className = 'room-card';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'room-image';
        imageDiv.textContent = '🛏️';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'room-content';
        contentDiv.innerHTML = `
            <div class="room-type">${room.tipo}</div>
            <div class="room-price">$${room.precio.toFixed(2)} <span>/noche</span></div>
            <div class="room-status available">Disponible</div>
        `;

        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = 'Reservar';
        btn.onclick = () => abrirReserva(room.id, room.tipo, room.precio);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'room-actions';
        actionsDiv.appendChild(btn);

        contentDiv.appendChild(actionsDiv);

        card.appendChild(imageDiv);
        card.appendChild(contentDiv);

        container.appendChild(card);
    });
}

/* ================================ */
/* RESERVAS (USUARIO NORMAL) */
/* ================================ */

async function crearReserva(e) {
    e.preventDefault();

    const modal = document.getElementById('reservationModal');
    const roomId = Number(modal.dataset.roomId);

    const checkIn = document.getElementById('reservationCheckIn').value;
    const checkOut = document.getElementById('reservationCheckOut').value;

    if (!checkIn || !checkOut) {
        mostrarAlerta("Completa las fechas.", "error");
        return;
    }
    if (checkOut <= checkIn) {
        mostrarAlerta("La fecha de salida debe ser posterior.", "error");
        return;
    }

    // Recargar reservas para la validación de solapamiento
    await cargarReservasParaValidacion();

    const reservasActivas = reservas.filter(r => r.roomId === roomId && r.estado === 'confirmada');
    const solapamiento = reservasActivas.some(r => (checkIn < r.checkOut && checkOut > r.checkIn));

    if (solapamiento) {
        mostrarAlerta("La habitación no está disponible en esas fechas.", "error");
        return;
    }

    const nuevaReserva = {
        userId: usuarioActual.id,
        roomId,
        checkIn,
        checkOut,
        estado: "confirmada" // Se crea directamente como confirmada
    };

    try {
        const resReserva = await fetch(API_RESERVATIONS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaReserva)
        });

        if (!resReserva.ok) throw new Error("Error al guardar reserva");

        const habitacion = habitaciones.find(h => h.id === roomId);

        // Bloquear la habitación
        if (habitacion) {
            const updatedRoom = {
                id: roomId,
                tipo: habitacion.tipo,
                precio: habitacion.precio,
                disponible: false // Se marca como no disponible al reservar
            };

            const response = await fetch(${API_ROOMS}/${roomId}, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRoom)
            });

            if (!response.ok) throw new Error("Error al actualizar habitación");
        }

        mostrarAlerta("Reserva creada con éxito", "success");
        closeModal("reservationModal");

        cargarHabitaciones(); // Actualizar vista de habitaciones
        cargarReservas(); // Actualizar la lista de reservas (si está en la vista)

    } catch (err) {
        console.error('Error al crear reserva:', err);
        mostrarAlerta('Error al crear reserva', 'error');
    }
}

function abrirReserva(roomId, tipo, precio) {
    document.getElementById('reservationRoomId').value = ${roomId} - ${tipo};
    document.getElementById('reservationCheckIn').value = '';
    document.getElementById('reservationCheckOut').value = '';
    document.getElementById('reservationModal').dataset.roomId = roomId;
    document.getElementById('reservationModal').dataset.roomPrice = precio;
    openModal('reservationModal');
}

async function cargarReservas() {
    try {
        const response = await fetch(API_RESERVATIONS);
        if (!response.ok) throw new Error('Error en fetch');

        const data = await response.json();
        reservas = data.map(r => new Reservation(r.id, r.userId, r.roomId, r.checkIn, r.checkOut, r.estado));

        mostrarReservas();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar reservas', 'error');
    }
}

function mostrarReservas() {
    const tbody = document.getElementById('reservationsBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const misReservas = reservas.filter(r => r.userId === usuarioActual.id);

    if (misReservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No tienes reservas</td></tr>';
        return;
    }

    misReservas.forEach(res => {
        const room = habitaciones.find(h => h.id === res.roomId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${res.id}</td>
            <td>${room ? room.tipo : 'Habitación ' + res.roomId}</td>
            <td>${res.checkIn}</td>
            <td>${res.checkOut}</td>
            <td><span class="status-badge ${res.estado}">${res.estado}</span></td>
            <td>
                ${res.estado !== 'cancelada' ? <button class="btn btn-danger btn-small btn-cancelUser" data-reserva-id="${res.id}">Cancelar</button> : ''}
            </td>
        `;

        const btnCancel = row.querySelector('.btn-cancelUser');
        if (btnCancel) {
            btnCancel.onclick = () => cancelarReserva(res.id);
        }

        tbody.appendChild(row);
    });
}

// * FUNCIÓN DE CANCELAR RESERVA DE USUARIO (USANDO LÓGICA DE script2.js - PUT con estado 'cancelada') *
async function cancelarReserva(reservaId) {
    if (!confirm('¿Cancelar esta reserva?')) return;

    const reserva = reservas.find(r => r.id === reservaId && r.userId === usuarioActual.id);

    if (!reserva) {
        mostrarAlerta('No puedes cancelar esta reserva o no existe', 'error');
        return;
    }

    const eraConfirmada = reserva.estado === 'confirmada';
    // Crear una copia del objeto de reserva para el PUT
    const updatedReserva = { ...reserva.toJSON(), estado: 'cancelada' };

    try {
        // 1. Actualizar estado de la reserva a 'cancelada'
        const response = await fetch(${API_RESERVATIONS}/${reservaId}, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReserva)
        });

        if (!response.ok) throw new Error('Error al actualizar reserva');

        // 2. Liberar habitación si estaba confirmada
        if (eraConfirmada) {
            const habitacion = habitaciones.find(h => h.id === reserva.roomId);

            if (habitacion) {
                const updatedRoom = {
                    id: habitacion.id,
                    tipo: habitacion.tipo,
                    precio: habitacion.precio,
                    disponible: true
                };

                await fetch(${API_ROOMS}/${reserva.roomId}, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedRoom)
                });
            }
        }

        mostrarAlerta('Reserva cancelada', 'success');
        // Recargar datos y vistas
        cargarReservas();
        cargarHabitaciones();

    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al cancelar', 'error');
    }
}


/* ================================ */
/* DASHBOARD ADMIN - VISTAS y DATOS */
/* ================================ */

function initAdminDashboard() {
    const dashboard = document.getElementById('dashboardView');
    if (!dashboard) return;

    let actions = document.getElementById('adminActions');

    if (!actions) {
        actions = document.createElement('div');
        actions.id = 'adminActions';
        actions.style.display = 'flex';
        actions.style.gap = '0.5rem';
        actions.style.justifyContent = 'center';
        actions.style.marginBottom = '1rem';

        const btnCrear = document.createElement('button');
        btnCrear.className = 'btn btn-primary';
        btnCrear.textContent = 'Crear habitación';
        btnCrear.addEventListener('click', () => openModal('roomModal'));

        const btnVer = document.createElement('button');
        btnVer.className = 'btn btn-secondary';
        btnVer.textContent = 'Ver reservas (Admin)';
        btnVer.addEventListener('click', verReservasAdmin);

        const btnCancelar = document.createElement('button');
        btnCancelar.className = 'btn btn-danger';
        btnCancelar.textContent = 'Cancelar reserva por ID';
        btnCancelar.addEventListener('click', cancelarReservaAdminPrompt);

        actions.appendChild(btnCrear);
        actions.appendChild(btnVer);
        actions.appendChild(btnCancelar);

        dashboard.insertBefore(actions, dashboard.firstChild);
    }
}

async function actualizarEstadisticasDirecto() {
    try {
        const [roomsRes, resRes] = await Promise.all([
            fetch(API_ROOMS),
            fetch(API_RESERVATIONS)
        ]);

        if (!roomsRes.ok || !resRes.ok) throw new Error('Error al cargar datos');

        const rooms = await roomsRes.json();
        const resvs = await resRes.json();

        // Actualizar variables globales (necesarias para renderGraficoFromData)
        habitaciones = rooms.map(r => new Room(r.id, r.tipo, r.precio, r.disponible));
        reservas = resvs.map(r => new Reservation(r.id, r.userId, r.roomId, r.checkIn, r.checkOut, r.estado));

        const totalRoomsEl = document.getElementById('totalRooms');
        const confirmedEl = document.getElementById('confirmedReservations');
        const pendingEl = document.getElementById('pendingReservations');
        const cancelledEl = document.getElementById('cancelledReservations');

        if (totalRoomsEl) totalRoomsEl.textContent = rooms.length;

        const confirmadas = resvs.filter(r => r.estado === 'confirmada').length;
        const pendientes = resvs.filter(r => r.estado === 'pendiente').length;
        const canceladas = resvs.filter(r => r.estado === 'cancelada').length;

        if (confirmedEl) confirmedEl.textContent = confirmadas;
        if (pendingEl) pendingEl.textContent = pendientes;
        if (cancelledEl) cancelledEl.textContent = canceladas;

        renderGraficoFromData(resvs);

    } catch (e) {
        console.error(e);
        mostrarAlerta('No se pudieron actualizar las estadísticas', 'error');
    }
}

function renderGraficoFromData(resvs) {
    const canvas = document.getElementById('reservationsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const confirmadas = resvs.filter(r => r.estado === 'confirmada').length;
    const pendientes = resvs.filter(r => r.estado === 'pendiente').length;
    const canceladas = resvs.filter(r => r.estado === 'cancelada').length;

    const data = [pendientes, confirmadas, canceladas];
    const labels = ['Pendientes', 'Confirmadas', 'Canceladas'];
    const colors = ['#FFA500', '#008000', '#FF0000'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(...data, 1);
    const barWidth = canvas.width / data.length / 2;

    data.forEach((value, index) => {
        const barHeight = (value / max) * (canvas.height - 20);
        const x = index * canvas.width / data.length + barWidth / 2;
        const y = canvas.height - barHeight;

        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Texto de la etiqueta
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 5);
        // Texto del valor
        ctx.fillText(value, x + barWidth / 2, y - 5);
    });
}

/* ================================ */
/* DASHBOARD ADMIN - ACCIONES */
/* ================================ */

async function handleCreateRoom(e) {
    e.preventDefault();

    const tipo = document.getElementById('roomTipo').value.trim();
    const precio = Number(document.getElementById('roomPrecio').value);
    const disponible = document.getElementById('roomDisponible').value === 'true';

    if (!tipo || !precio) {
        mostrarAlerta('Completa los datos de la habitación', 'error');
        return;
    }

    try {
        const res = await fetch(API_ROOMS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, precio, disponible })
        });

        if (!res.ok) throw new Error('Error al crear habitación');

        document.getElementById('roomForm').reset();
        closeModal('roomModal');
        mostrarAlerta('Habitación creada', 'success');

        actualizarEstadisticasDirecto(); // Recargar el dashboard

    } catch (err) {
        console.error(err);
        mostrarAlerta('No se pudo crear la habitación', 'error');
    }
}

// * VISTA DE RESERVAS PARA ADMIN *
async function verReservasAdmin() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'block';

    const backBtn = document.getElementById('btnUserHabitaciones');

    if (backBtn) {
        backBtn.textContent = 'Volver al Dashboard';
        backBtn.onclick = () => {
            document.getElementById('reservationsView').style.display = 'none';
            document.getElementById('dashboardView').style.display = 'block';
            actualizarEstadisticasDirecto();
        };
    }

    await renderAdminReservationsTable();
}

async function renderAdminReservationsTable() {
    const tbody = document.getElementById('reservationsBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

    try {
        const [resRes, roomsRes] = await Promise.all([
            fetch(API_RESERVATIONS),
            fetch(API_ROOMS)
        ]);

        if (!resRes.ok || !roomsRes.ok) throw new Error('Error al cargar datos');

        const reservasData = await resRes.json();
        const roomsData = await roomsRes.json();

        tbody.innerHTML = '';

        if (!Array.isArray(reservasData) || reservasData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay reservas</td></tr>';
            return;
        }

        reservasData.forEach(res => {
            const room = roomsData.find(r => Number(r.id) === Number(res.roomId));

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${res.id}</td>
                <td>${room ? room.tipo : ('Habitación ' + res.roomId)}</td>
                <td>${res.checkIn}</td>
                <td>${res.checkOut}</td>
                <td><span class="status-badge ${res.estado}">${res.estado}</span></td>
                <td>
                    ${res.estado !== 'cancelada' ? <button class="btn btn-danger btn-small btn-cancelAdmin" data-id="${res.id}">Cancelar</button> : ''}
                </td>
            `;

            tbody.appendChild(tr);
        });

        // Delegación de evento para la cancelación de Admin
        tbody.onclick = (ev) => {
            const btn = ev.target.closest('.btn-cancelAdmin');
            if (btn) {
                const id = Number(btn.dataset.id);
                cancelReservaAdmin(id);
            }
        };

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6">Error al cargar reservas</td></tr>';
    }
}

function cancelarReservaAdminPrompt() {
    const input = prompt('Ingrese el ID de la reserva a cancelar:');
    if (!input) return;

    const id = Number(input);
    if (Number.isNaN(id) || id <= 0) {
        mostrarAlerta('ID inválido', 'error');
        return;
    }

    cancelReservaAdmin(id);
}

// * FUNCIÓN DE CANCELAR RESERVA DE ADMIN *
async function cancelReservaAdmin(reservaId) {
    if (!confirm(¿Está seguro de cancelar la reserva ID: ${reservaId}?)) return;

    try {
        // 1. Obtener la reserva
        const resGet = await fetch(${API_RESERVATIONS}/${reservaId});
        if (!resGet.ok) {
            mostrarAlerta('Reserva no encontrada', 'error');
            return;
        }
        const reserva = await resGet.json();
        const eraConfirmada = reserva.estado === 'confirmada';
        reserva.estado = 'cancelada';

        // 2. Actualizar estado de la reserva a 'cancelada'
        const resUpdate = await fetch(${API_RESERVATIONS}/${reservaId}, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
        });

        if (!resUpdate.ok) throw new Error('Error al cancelar');

        // 3. Liberar habitación si estaba confirmada
        if (eraConfirmada) {
            const roomRes = await fetch(${API_ROOMS}/${reserva.roomId});
            if (roomRes.ok) {
                const room = await roomRes.json();
                room.disponible = true;

                await fetch(${API_ROOMS}/${room.id}, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(room)
                });
            }
        }

        mostrarAlerta(Reserva #${reservaId} cancelada por admin, 'success');
        // Actualizar vistas del admin
        verReservasAdmin();

    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al cancelar reserva', 'error');
    }
}
