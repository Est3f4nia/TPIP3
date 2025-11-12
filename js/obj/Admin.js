import { User } from './User.js';
import { Room } from './Room.js';
import { Reservation } from './Reservation.js';

class Admin extends User {
    constructor(name, email, pass, role = 'admin') {
        super(name, email, pass);
        this.role = role;
    }

    async crearUsuario() {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const pass = document.getElementById("pass").value;

        const u = new User(name, email, pass);

        try {
            const conn = await fetch("https://691488943746c71fe0489e1c.mockapi.io/api/users/users", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(u)
            });

            if (!conn.ok) {
                console.error('Error al crear usuario:', conn.status, await conn.text());
                return;
            }

            const result = await conn.json();
            console.log('Usuario creado:', result);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    async deleteUser(userId) {
        try {
            const conn = await fetch(`https://691488943746c71fe0489e1c.mockapi.io/api/users/users/${userId}`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' }
            });

            if (!conn.ok) {
                console.error('Error al eliminar:', conn.status);
                return;
            }

            console.log('Usuario eliminado');
        } catch (err) {
            console.error('Error:', err);
        }
    }

    async deleteUser(userId) {
        try {
            const conn = await fetch(`https://691488943746c71fe0489e1c.mockapi.io/api/users/users/${userId}`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' }
            });

            if (!conn.ok) {
                console.error('Error al eliminar:', conn.status);
                return;
            }

            console.log('Usuario eliminado');
        } catch (err) {
            console.error('Error:', err);
        }
    }

    async crearRoom() {
        const tipo = document.getElementById("tipo").value;
        const precio = document.getElementById("precio").value;
        const disponible = document.getElementById("disponible").value;

        const r = new Room(tipo, precio, disponible);

        try {
            const conn = await fetch("https://691488943746c71fe0489e1c.mockapi.io/api/rooms/rooms", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(r)
            });

            if (!conn.ok) {
                console.error('Error al crear la habitación:', conn.status, await conn.text());
                return;
            }

            const result = await conn.json();
            console.log('Habitación creada:', result);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    async crearReservation() { // modificar, similar a crearRoom()

        // falta comprobación de que userId y roomId existan en las APIs
        const checkIn = document.getElementById("checkIn").value;
        const checkOut = document.getElementById("checkOut").value;
        const estado = document.getElementById("estado").value;

        const r = new Room(userId, roomId, checkIn, checkOut, estado);

        try {
            const conn = await fetch("https://691488943746c71fe0489e1c.mockapi.io/api/reservations/reservations", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(r)
            });

            if (!conn.ok) {
                console.error('Error al crear la reserva:', conn.status, await conn.text());
                return;
            }

            const result = await conn.json();
            console.log('Reserva creada:', result);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    async cancelarReserva(reservaId) {
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

    async updatePrecio(roomId, precio) {
        try {
            const updatedData = { precio: precio };
            const conn = await fetch(`https://691488943746c71fe0489e1c.mockapi.io/api/users/users/${roomId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!conn.ok) {
                console.error('Error al actualizar:', conn.status);
                return;
            }

            const result = await conn.json();
            console.log('Precio actualizado:', result);
        } catch (err) {
            console.error('Error:', err);
        }
    }

    // falta adm rooms y reservas
}

export { Admin };
