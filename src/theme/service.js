const pool = require('../config/db');

const Theme = {
  async createTheme(label) {
    const result = await pool.query(
      `INSERT INTO themes (label) VALUES ($1) RETURNING *`,
      [label]
    );
    return result.rows[0];
  },

  async getAllThemes() {
    const result = await pool.query(`SELECT * FROM themes`);
    return result.rows;
  },

  async getThemeById(id) {
    const result = await pool.query(`SELECT * FROM themes WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async updateTheme(id, label) {
    const result = await pool.query(
      `UPDATE themes SET label = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [label, id]
    );
    return result.rows[0];
  },

  async deleteTheme(id) {
    await pool.query(`DELETE FROM themes WHERE id = $1`, [id]);
    return { message: 'Thème supprimé' };
  },
};

module.exports = Theme;
