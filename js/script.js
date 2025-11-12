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

function loadReservations() {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('roomsView').style.display = 'none';
    document.getElementById('reservationsView').style.display = 'block';
    cargarReservas();
}
