import User from './User.js';
import Room from './Room.js';
import Reservation from './Reservation.js';

const API_USERS = 'https://691488943746c71fe0489e1c.mockapi.io/api/users/users';
const API_ROOMS = 'https://691488943746c71fe0489e1c.mockapi.io/api/rooms/rooms';
const API_RESERVATIONS = 'https://691488943746c71fe0489e1c.mockapi.io/api/reservations/reservations';

class Admin extends User {
    constructor(id, nombre, email, password, role = 'ADMIN') {
        super(id, nombre, email, password, role)
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`${API_USERS}/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`Error al eliminar: ${response.status}`);
            console.log('Usuario eliminado');
            // DOM
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar usuario');
        }
    }

    async crearRoom(tipo, precio, disponible) {
        const roomData = { tipo, precio, disponible };

        try {
            const response = await fetch(API_ROOMS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });

            if (!response.ok) throw new Error(`Error al crear habitación: ${response.status}`);
            // ver el tema de los logs en terminal
            const result = await response.json();
            console.log('Habitación creada:', result);
            return new Room(result.id, result.tipo, result.precio, result.disponible);  // Instancia con id
        } catch (err) {
            console.error('Error:', err);
            alert('Error al crear habitación');
        }
    }

    async crearReservation(userId, roomId, checkIn, checkOut, estado) {
        try {
            const userCheck = await fetch(`${API_USERS}/${userId}`);
            if (!userCheck.ok) throw new Error('UserId no existe');
            
            const roomCheck = await fetch(`${API_ROOMS}/${roomId}`);
            if (!roomCheck.ok) throw new Error('RoomId no existe');

            const resData = { userId, roomId, checkIn, checkOut, estado };
            const response = await fetch(API_RESERVATIONS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resData)
            });
            
            if (!response.ok) {
                throw new Error(`Error al crear reserva: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Reserva creada:', result);
            return new Reservation(result.id, result.userId, result.roomId, result.checkIn, result.checkOut, result.estado);
        } catch (err) {
            console.error('Error:', err);
            alert('Error al crear reserva');
        }
    }

    async cancelarReserva(reservaId) {
        if (!confirm('¿Estás seguro de cancelar esta reserva?')) return; // ???
        
        try {
            const response = await fetch(`${API_RESERVATIONS}/${reservaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'cancelada' })
            });

            if (!response.ok) {
                throw new Error(`Error al cancelar: ${response.status}`);
            }
            // esto no va, modificar en script.js
            mostrarAlerta('Reserva cancelada', 'success');
            cargarReservas();
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cancelar', 'error');
        }
    }

    async updatePrecio(roomId, nuevoPrecio) {
        try {
            const response = await fetch(`${API_ROOMS}/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ precio: nuevoPrecio })
            });

            if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);

            const result = await response.json();
            console.log('Precio actualizado:', result); // DOM
        } catch (err) {
            console.error('Error:', err);
            alert('Error al actualizar precio');
        }
    }

    async getAllRooms() {
        try {
            const response = await fetch(API_ROOMS);
            if (!response.ok) throw new Error('Error al listar habitaciones');
            return await response.json();  // Array
        } catch (err) {
            console.error(err);
        }
    }

    async getAllReservations() {
        try {
            const response = await fetch(API_RESERVATIONS);
            if (!response.ok) throw new Error('Error al listar reservas');
            return await response.json();
        } catch (err) {
            console.error(err);
        }
    }
}
