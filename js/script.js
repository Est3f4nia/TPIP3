const API_USERS = 'https://691488943746c71fe0489e1c.mockapi.io/api/users/users';
const API_ROOMS = 'https://691485293746c71fe04891b2.mockapi.io/api/rooms/rooms';
const API_RESERVATIONS = 'https://691484693746c71fe0488f7d.mockapi.io/api/reservations/reservations';

let usuarios = [];
let habitaciones = [];
let reservas = [];
let usuarioActual = null;

// ============================================
// PARTE 1: AUTENTICACIÓN Y LOGIN
// (Encargada: [Nombre persona 1])
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();

    // Verificar si hay usuario guardado
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        mostrarVistaPrincipal();
    } else {
        mostrarVistaLogin();
    }

    // Event listeners
    if (document.getElementById('authForm')) {
        document.getElementById('authForm').addEventListener('submit', manejarLogin);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }
});

// Cargar usuarios desde MockAPI

// !!!) No conviene hacer un fetch(id user)? si el sistema crece tardaría mucho y ocuparía mucho el guardar TODOS los usuarios en la web
async function cargarUsuarios() {
    try {
        const response = await fetch(API_USERS);
        usuarios = await response.json();
        console.log('Usuarios cargados:', usuarios);  // elminar después -> filtra BD en consola
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarAlerta('Error al conectar con el servidor', 'error');
    }
}

// Manejar login
function manejarLogin(e) {
    e.preventDefault(); // kiesesto

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const usuario = usuarios.find(u => u.email === email && u.password === password); // acá en vez de trabajar con el array podríamos meter un fetch -> la función cargarUsuarios() se saca

    if (usuario) {
        usuarioActual = usuario;
        localStorage.setItem('usuarioActual', JSON.stringify(usuario)); // manejo de cookie?
        document.getElementById('authForm').reset();
        mostrarVistaPrincipal();
        mostrarAlerta('Bienvenido ' + usuario.nombre, 'success'); // cambiar alert por algo en el DOM
    } else {
        mostrarAlerta('Email o contraseña incorrectos', 'error'); // cambiar alert por algo en el DOM
    }
}

// Mostrar vista de login
function mostrarVistaLogin() {  // esto capaz hace conflicto con las inputs?
    document.getElementById('authView').style.display = 'flex';
    document.getElementById('appView').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
}

// Mostrar vista principal
function mostrarVistaPrincipal() {
    document.getElementById('authView').style.display = 'none';
    document.getElementById('appView').style.display = 'block';
    document.getElementById('userInfo').style.display = 'flex';

    document.getElementById('userName').textContent = usuarioActual.nombre;
    document.getElementById('userRole').textContent = usuarioActual.rol === 'admin' ? 'ADMIN' : 'USUARIO';  // explicaesto

    if (usuarioActual.rol === 'admin') { // cambia la vista según el rol?
        document.getElementById('dashboardView').style.display = 'block';
        document.getElementById('roomsView').style.display = 'none';
        document.getElementById('reservationsView').style.display = 'none';
    } else {
        document.getElementById('dashboardView').style.display = 'none';
        document.getElementById('roomsView').style.display = 'block';
        document.getElementById('reservationsView').style.display = 'none';
    }
}

// Cerrar sesión
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuarioActual');
    document.getElementById('authForm').reset();
    mostrarVistaLogin();
    mostrarAlerta('Sesión cerrada correctamente', 'success'); // no haría falta -> sacar para entregar
}

async function crearUsuario() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const pass = document.getElementById("registerPassword").value;

    const u = new User(name, email, pass);

    try {
        const conn = await fetch("https://691488943746c71fe0489e1c.mockapi.io/api/users/users", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
        });

        if (!conn.ok) {
            console.error('Error al crear usuario:', conn.status, await conn.text());
            throw new Error();
        }

        const result = await conn.json();
        console.log('Usuario creado:', result);
    } catch (err) {
        console.error('Error al conectarse a la API:', err);
    }
}

// Cambiar entre login y registro
function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');

    // anda, pero me confunde el usar display para cambiar el form
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authTitle.textContent = 'Iniciar Sesión';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        authTitle.textContent = 'Registrarse';
    }
}

// ============================================
// PARTE 2: HABITACIONES
// (Encargada: [Nombre persona 2])
// ============================================

async function cargarHabitaciones() {
    try {
        const response = await fetch(API_ROOMS);
        habitaciones = await response.json(); // mismo que con users -> podemos directamente usar for en la api o algo asi?
        console.log('Habitaciones cargadas:', habitaciones);
        mostrarHabitaciones();
    } catch (error) {
        console.error('Error al cargar habitaciones:', error);
        mostrarAlerta('Error al cargar habitaciones', 'error');
    }
}

function mostrarHabitaciones() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (habitaciones.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No hay habitaciones</p>';
        return;
    }

    habitaciones.forEach(room => {
        const disponible = room.disponible === true || room.disponible === 'true';
        const card = document.createElement('div');
        card.className = 'room-card';

        // a lo mejor conviene evitar el innerHTML (buena práctica)
        card.innerHTML = `
            <div class="room-image">🛏️</div>
            <div class="room-content">
                <div class="room-type">${room.tipo}</div>
                <div class="room-price">$${parseFloat(room.precio).toFixed(2)}<span>/noche</span></div>
                <div class="room-status ${disponible ? 'available' : 'unavailable'}">
                    ${disponible ? '✓ Disponible' : '✗ No disponible'}
                </div>
                <p class="room-description">Habitación cómoda con todas las comodidades.</p>
                <div class="room-actions">
                    <button class="btn btn-primary" onclick="abrirReserva(${room.id}, '${room.tipo}', ${room.precio})">
                        Reservar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// display raro
function loadRooms() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'block';
    document.getElementById('reservationsView').style.display = 'none';
    cargarHabitaciones();
}

// ============================================
// PARTE 3: RESERVAS
// (Encargada: [Nombre persona 3])
// ============================================

async function cargarReservas() {
    try {
        const response = await fetch(API_RESERVATIONS);
        reservas = await response.json();
        console.log('Reservas cargadas:', reservas);
        mostrarReservas();
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        mostrarAlerta('Error al cargar reservas', 'error');
    }
}

function mostrarReservas() {
    const tbody = document.getElementById('reservationsBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const misReservas = reservas.filter(r => r.userId == usuarioActual.id);

    if (misReservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No tienes reservas</td></tr>';
        return;
    }

    misReservas.forEach(res => {
        const room = habitaciones.find(h => h.id == res.roomId);
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

// esto crea un reserva? si sí entonces va como método de user

function abrirReserva(roomId, tipo, precio) {
    document.getElementById('reservationRoomId').value = `${roomId} - ${tipo}`;
    document.getElementById('reservationCheckIn').value = '';
    document.getElementById('reservationCheckOut').value = '';

    document.getElementById('reservationModal').dataset.roomId = roomId;
    document.getElementById('reservationModal').dataset.roomPrice = precio;

    openModal('reservationModal');
}


// método de user
async function cancelarReserva(reservaId) {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
        const response = await fetch(`${API_RESERVATIONS}/${reservaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'cancelada' })
        });

        if (response.ok) {
            mostrarAlerta('Reserva cancelada', 'success');
            cargarReservas();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cancelar', 'error');
    }
}

function loadReservations() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'block';
    cargarReservas();
}

// ============================================
// PARTE 4: DASHBOARD ADMIN
// (Encargada: [Nombre persona 4])
// ============================================

async function cargarDatos() {
    await Promise.all([cargarHabitaciones(), cargarReservas()]);
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const totalHabitaciones = habitaciones.length;
    const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
    const reservasCanceladas = reservas.filter(r => r.estado === 'cancelada').length;

    document.getElementById('totalRooms').textContent = totalHabitaciones;
    document.getElementById('confirmedReservations').textContent = reservasConfirmadas;
    document.getElementById('pendingReservations').textContent = reservasPendientes;
    document.getElementById('cancelledReservations').textContent = reservasCanceladas;
}

function showDashboard() {
    if (usuarioActual.rol !== 'admin') {
        mostrarAlerta('Solo administradores', 'error');
        return;
    }

    document.getElementById('dashboardView').style.display = 'block';
    document.getElementById('roomsView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'none';
    cargarDatos();
}

// ============================================
// UTILIDADES GENERALES
// ============================================

// de esto no entedí nada

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
    const alertContainer = document.getElementById('alertContainer') || document.querySelector('.container') || document.body;

    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    if (alertContainer) {
        alertContainer.insertBefore(alert, alertContainer.firstChild);
    }

    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 4000);
}

// Event listeners

document.getElementById("btn-registrar").addEventListener("click", () => {
    crearUsuario();
})
