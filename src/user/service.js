const pool = require('../config/db');

const User = {
    async createUser(name, role_id,buzzer_id) {
        const result = await pool.query(
        `INSERT INTO users (name, role_id, buzzer_id) VALUES ($1, $2, $3) RETURNING *`,
        [name, role_id, buzzer_id]
        );
        return result.rows[0];
    },

    async getUserById(id) {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
        return result.rows[0];
    },

    async getAllUsers() {
        const result = await pool.query(`SELECT * FROM users`);
        return result.rows;
    },

    async getUserByIdByRole(id, role_id) {
        const result = await pool.query(
            `SELECT * FROM users WHERE id = $1 AND role_id = $2`,
            [id, role_id]
        );
        return result.rows[0];
    },

    async updateUser(name, role_id, buzzer_id, id) {
        
        const result = await pool.query(
        `UPDATE users SET name = $1, role_id = $2, buzzer_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
        [name, role_id, buzzer_id, id]
        );
        return result.rows[0];
    },

    async deleteUser(id) {
        await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
        return { message: 'Utilisateur supprimé' };
    },


};

module.exports = User;
