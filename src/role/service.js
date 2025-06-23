const pool = require('../config/db');

const Role = {
  async createRole(name) {
    const result = await pool.query(
      `INSERT INTO roles (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return result.rows[0];
  },

  async getAllRoles() {
    const result = await pool.query(`SELECT * FROM roles`);
    return result.rows;
  },

  async getRoleById(id) {
    const result = await pool.query(`SELECT * FROM roles WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async updateRole(id, name) {
    const result = await pool.query(
      `UPDATE roles SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [name, id]
    );
    return result.rows[0];
  },

  async deleteRole(id) {
    await pool.query(`DELETE FROM roles WHERE id = $1`, [id]);
    return { message: 'Role supprimé' };
  },
};

module.exports = Role;
