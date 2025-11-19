class Reservation {
    constructor(id, userId, roomId, checkIn, checkOut, estado) {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.estado = estado;
    }

    getEstado() {
        return this.estado;
    }

    setEstado(nuevoEstado) {
        if (!['Confirmada', 'Cancelada'].includes(nuevoEstado)) throw new Error('Estado inválido');
        this.estado = nuevoEstado;
    }

    // para stringify en fetch (puede servir?)
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            roomId: this.roomId,
            checkIn: this.checkIn,
            checkOut: this.checkOut,
            estado: this.estado
        };
    }
}

export { Reservation };
