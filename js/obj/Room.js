class Room {
    constructor(id, tipo, precio, disponible) {
        this.id = id;
        this.tipo = tipo;
        this.precio = precio;
        this.disponible = disponible;

        // Validaciones
        if (typeof precio !== 'number' || precio <= 0) throw new Error('Precio debe ser un número positivo');
        if (typeof disponible !== 'boolean') throw new Error('Disponible debe ser booleano (true/false)');
    }

    getPrecio() {
        return this.precio;
    }

    setPrecio(nuevoPrecio) {
        if (typeof nuevoPrecio !== 'number' || nuevoPrecio <= 0) throw new Error('Precio debe ser un número positivo');
        this.precio = nuevoPrecio;
    }

    // para stringify en fetch (puede servir?)
    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            precio: this.precio,
            disponible: this.disponible
        };
    }
}

export { Room };
