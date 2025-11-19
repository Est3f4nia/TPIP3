import { User } from './classes/User.js';
import { Room } from './classes/Room.js';
import { Reservation } from './classes/Reservation.js';

const API_USERS = 'https://691d039cd58e64bf0d34b8a1.mockapi.io/users/users';
const API_ROOMS = 'https://691d039cd58e64bf0d34b8a1.mockapi.io/users/rooms';
const API_RESERVATIONS = 'https://691484693746c71fe0488f7d.mockapi.io/api/reservations/reservations';

let habitaciones = [];
let reservas = [];
let usuarioActual = null;

// ================================
// TOGGLE LOGIN / REGISTRO
// ================================

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

window.toggleAuthForm = toggleAuthForm;
window.cerrarSesion = cerrarSesion;
window.manejarLogin = manejarLogin;
window.crearUsuario = crearUsuario;

// ================================
// INICIO: CARGA INICIAL
// ================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log(API_ROOMS);
console.log(`${API_ROOMS}/1`);


    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarVistaPrincipal();
    } else {
        mostrarVistaLogin();
    }

    // Listeners correctos
    document.getElementById('loginForm').addEventListener('submit', manejarLogin);
    document.getElementById('registerForm').addEventListener('submit', crearUsuario);
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    document.getElementById('reservationForm').addEventListener('submit', crearReserva);
});

// ================================
// VISTAS
// ================================

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
        cargarDatos(); // stats + gráfico
    } else {
        document.getElementById('dashboardView').style.display = 'none';
        document.getElementById('roomsView').style.display = 'block';
        document.getElementById('reservationsView').style.display = 'none';
        cargarHabitaciones(); // SOLO USUARIO
    }
}

// ================================
// LOGIN / REGISTRO
// ================================

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
        mostrarAlerta(`Bienvenido ${usuario.nombre}`, 'success');

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

        if (!response.ok) throw new Error(`Error: ${response.status}`);

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

// ================================
// HABITACIONES
// ================================

async function cargarHabitaciones() {
    try {
        const response = await fetch(API_ROOMS);
        if (!response.ok) throw new Error('Error en fetch');

        habitaciones = await response.json();
        habitaciones = habitaciones.map(r => new Room(r.id, r.tipo, r.precio, r.disponible));

        mostrarHabitaciones();

    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar habitaciones', 'error');
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
        const disponible = room.disponible;

        const card = document.createElement('div');
        card.className = 'room-card';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'room-image';
        imageDiv.textContent = '🛏️';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'room-content';
        contentDiv.innerHTML = `
            <div class="room-type">${room.tipo}</div>
            <div class="room-price">$${room.precio.toFixed(2)}<span> /noche</span></div>
            <div class="room-status ${disponible ? 'available' : 'unavailable'}">
                ${disponible ? 'Disponible' : 'No disponible'}
            </div>
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

// ================================
// RESERVAS (USUARIO NORMAL)
// ================================

async function crearReserva(e) {
    e.preventDefault();

    const modal = document.getElementById('reservationModal');
    const roomId = Number(modal.dataset.roomId);
    console.log('Crear reserva para habitación ID:', roomId);

    const checkIn = document.getElementById('reservationCheckIn').value;
    const checkOut = document.getElementById('reservationCheckOut').value;

    if (!checkIn || !checkOut) {
        mostrarAlerta("Completa las fechas.", "error");
        return;
    }
    if (checkOut <= checkIn) {
        mostrarAlerta("La fecha de salida debe ser posterior a la de entrada.", "error");
        return;
    }

    const nuevaReserva = {
        userId: usuarioActual.id,
        roomId: roomId,
        checkIn,
        checkOut,
        estado: "Confirmada"
    };

    try {
        const resReserva = await fetch(API_RESERVATIONS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaReserva)
        });
        if (!resReserva.ok) throw new Error("Error al guardar reserva");

        // Marcar habitación como no disponible
        const habitacion = habitaciones.find(h => h.id == roomId);

        if (habitacion) {
            const updatedRoom = { 
                tipo: habitacion.tipo,
                precio: habitacion.precio,
                disponible: false
            };

            await fetch(API_ROOMS, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRoom)
            });
        }

        mostrarAlerta("Reserva creada con éxito", "success");
        closeModal("reservationModal");
        cargarHabitaciones();
        cargarReservas();

    } catch (err) {
        console.error('Error al crear reserva:', err);
        mostrarAlerta('Error al crear reserva', 'error');
    }
}


function abrirReserva(roomId, tipo, precio) {
    document.getElementById('reservationRoomId').value = `${roomId} - ${tipo}`;
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

        reservas = await response.json();
        reservas = reservas.map(r => new Reservation(r.id, r.userId, r.roomId, r.checkIn, r.checkOut, r.estado));

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
                <button class="btn btn-danger btn-small" onclick="cancelarReserva(${res.id})">Cancelar</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function loadReservations() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'block';
    cargarReservas();
}

async function cancelarReserva(reservaId) {
    if (!confirm('¿Cancelar esta reserva?')) return;

    const reserva = reservas.find(r => r.id === reservaId && r.userId === usuarioActual.id);
    if (!reserva) {
        mostrarAlerta('No puedes cancelar esta reserva', 'error');
        return;
    }

    reserva.setEstado('Cancelada');

    try {
        await fetch(`${API_RESERVATIONS}/${reservaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva.toJSON())
        });

        mostrarAlerta('Reserva cancelada', 'success');
        cargarReservas();

    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al cancelar', 'error');
    }
}

// ================================
// DASHBOARD ADMIN
// ================================

async function cargarDatos() {
    await Promise.all([cargarHabitaciones(), cargarReservas()]);
    actualizarEstadisticas();
    renderGrafico();
}

function actualizarEstadisticas() {
    document.getElementById('totalRooms').textContent = habitaciones.length;
    document.getElementById('confirmedReservations').textContent = reservas.filter(r => r.estado === 'confirmada').length;
    document.getElementById('pendingReservations').textContent = reservas.filter(r => r.estado === 'pendiente').length;
    document.getElementById('cancelledReservations').textContent = reservas.filter(r => r.estado === 'cancelada').length;
}

function renderGrafico() {
    const canvas = document.getElementById('reservationsChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
    const canceladas = reservas.filter(r => r.estado === 'cancelada').length;

    const data = [pendientes, confirmadas, canceladas];
    const labels = ['Pendientes', 'Confirmadas', 'Canceladas'];
    const colors = ['#FFA500', '#008000', '#FF0000'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / data.length / 2;

    data.forEach((value, index) => {
        const barHeight = (value / Math.max(...data)) * (canvas.height - 20);
        ctx.fillStyle = colors[index];
        ctx.fillRect(index * canvas.width / data.length + barWidth / 2, canvas.height - barHeight, barWidth, barHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(labels[index], index * canvas.width / data.length + barWidth / 2, canvas.height - 5);
        ctx.fillText(value, index * canvas.width / data.length + barWidth / 2 + 10, canvas.height - barHeight - 5);
    });
}

// ================================
// MODALES & UTILIDADES
// ================================



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
    alert.className = `alert alert-${tipo}`;
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    alertContainer.insertBefore(alert, alertContainer.firstChild);

    setTimeout(() => alert.remove(), 5000);
}
