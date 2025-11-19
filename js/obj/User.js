class User {
    #password; 
    constructor(id, nombre, email, password, role) {
        this.id = id;  // ID único de MockAPI
        this.nombre = nombre;
        this.email = email;
        this.#password = password;
        this.role = role;  // 'ADMIN' o 'USUARIO'
    }

    getRole() {
        return this.role;
    }

    verifyPassword(inputPassword) {
        return this.#password === inputPassword;
    }

    // Método para cambiar password (solo para ADMIN, pero lo chequeamos en script.js)
    changePassword(newPassword) {
        this.#password = newPassword;
    }
}

export { User };
