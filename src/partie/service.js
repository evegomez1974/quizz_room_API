const pool = require('../config/db');

const Partie = {
  async createPartie(name_partie, score_partie) {
    const result = await pool.query(
      `INSERT INTO parties (name_partie, score_partie) VALUES ($1, $2) RETURNING *`,
      [name_partie, score_partie]
    );
    return result.rows[0];
  },

  // async getAllParties() {
  //   const result = await pool.query(`SELECT 
  //     p.name_partie,
  //     p.score_partie,
  //     u.name AS winner_name,
  //     pu.score AS winner_score
  //     FROM parties p
  //     JOIN parties_users pu ON pu.partie_id = p.id
  //     JOIN users u ON u.id = pu.user_id
  //     ORDER BY CAST(pu.score AS INTEGER) DESC
  //     ;`);
  //   return result.rows;
  // },

  async getAllParties() {
    const result = await pool.query(`SELECT 
      p.id,
      p.name_partie,
      p.score_partie,
      u.name AS winner_name
    FROM parties p
    JOIN parties_users pu ON pu.partie_id = p.id
    JOIN users u ON u.id = pu.user_id
    WHERE pu.score = (
      SELECT MAX(pu2.score)
      FROM parties_users pu2
      WHERE pu2.partie_id = p.id
    )
    ORDER BY p.id DESC;
      ;`);
    return result.rows;
  },

  async getPartieById(id) {
    const result = await pool.query(`SELECT * FROM parties WHERE id = $1`, [id]);
    return result.rows[0];
  },

  async updatePartie(id, name_partie, score_partie) {
    const result = await pool.query(
      `UPDATE parties 
      SET name_partie = $1, score_partie = $2, updated_at = NOW() 
      WHERE id = $3 
      RETURNING *`,
      [name_partie, score_partie, id]
    );

    return result.rows[0]; // peut être undefined si aucun résultat
  },


  async deletePartie(id) {
    await pool.query(`DELETE FROM parties WHERE id = $1`, [id]);
    return { message: 'Partie supprimée' };
  },
};

module.exports = Partie;
