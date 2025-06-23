const pool = require('../config/db');

const Buzzer = {
  async createBuzzer(name) {
    const result = await pool.query(
      `INSERT INTO buzzers (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return result.rows[0];
  },

  async getAllBuzzers() {
    const result = await pool.query(`SELECT * FROM buzzers`);
    return result.rows;
  },

  async getBuzzerById(id) {
    const result = await pool.query(`SELECT * FROM buzzers WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async updateBuzzer(id, name) {
    const result = await pool.query(
      `UPDATE buzzers SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [name, id]
    );
    return result.rows[0];
  },

  async deleteBuzzer(id) {
    await pool.query(`DELETE FROM buzzers WHERE id = $1`, [id]);
    return { message: 'Buzzer supprimé' };
  },
};

module.exports = Buzzer;
