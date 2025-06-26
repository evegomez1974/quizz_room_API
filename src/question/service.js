const pool = require('../config/db');

const Question = {
  async createQuestion(titre, label, points) {
    const result = await pool.query(
      `INSERT INTO questions (titre, label, points) VALUES ($1, $2, $3) RETURNING *`,
      [titre, label, points]
    );
    return result.rows[0];
  },

async addQuestionToTheme(themeId, questionId) {
  const result = await pool.query(
    `INSERT INTO questions_themes (theme_id, question_id) VALUES ($1, $2) RETURNING *`,
    [themeId, questionId]
  );
  return result.rows[0];
},


  async getAllQuestions() {
    const result = await pool.query(`SELECT * FROM questions`);
    return result.rows;
  },

  async getQuestionById(id) {
    const result = await pool.query(`SELECT * FROM questions WHERE id = $1`, [id]);
    return result.rows[0];
  },

async getQuestionsByTheme(themeId) {
    const result = await pool.query(`
        SELECT 
        q.id,
        q.titre,
        q.label,
        q.points,
        q.timer,
        t.id AS theme_id,
        t.label AS theme_label
        FROM questions_themes qt
        JOIN questions q ON qt.question_id = q.id
        JOIN themes t ON qt.theme_id = t.id
        WHERE qt.theme_id = $1
    `, [themeId]);

    return result.rows;
    },

  async updateQuestion(id, titre, label, points) {
    const result = await pool.query(
      `UPDATE questions SET titre = $1, label = $2, points = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [titre, label, points, id]
    );
    return result.rows[0];
  },

  async deleteQuestion(id) {
    await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
    return { message: 'Question supprimée' };
  },
};

module.exports = Question;
