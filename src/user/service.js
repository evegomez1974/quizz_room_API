const pool = require('../config/db');

const User = {
    async createUser(name, role_id,buzzer_id) {
        const result = await pool.query(
        `INSERT INTO users (name, role_id, buzzer_id) VALUES ($1, $2, $3) RETURNING *`,
        [name, role_id, buzzer_id]
        );
        return result.rows[0];
    },

    async resultPartie(user_id, partie_id, score) {
        const result = await pool.query(
          `INSERT INTO parties_users (user_id, partie_id, score)
            VALUES ($1, $2, $3)
            RETURNING *`,
        [user_id, partie_id, score]
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

async getUserByPartieAndQuestion(partieId, questionId) {
    const result = await pool.query(
        `SELECT user_id 
        FROM parties_questions 
        WHERE partie_id = $1 AND question_id = $2`,
        [partieId, questionId]
    );
    return result.rows[0]?.user_id || null;
    },

    async getUsersScoreForPartie(partieId) {
    const result = await pool.query(
        `SELECT 
            u.id AS user_id,
            u.name AS user_name,
            SUM(CAST(q.points AS INTEGER)) AS total_score
            FROM parties_questions pq
            JOIN users u ON pq.user_id = u.id
            JOIN questions q ON pq.question_id = q.id
            WHERE pq.partie_id = $1
            GROUP BY u.id, u.name
            ORDER BY total_score DESC;
            `,
        [partieId]
    );
    return result.rows;
    },

    

    async getUserScoreForPartie(user_id, partie_id) {
        const result = await pool.query(
            `SELECT 
            pu.score,
            u.name AS user_name,
            p.name_partie AS partie_name
            FROM parties_users pu
            JOIN users u ON pu.user_id = u.id
            JOIN parties p ON pu.partie_id = p.id
            WHERE pu.user_id = $1 AND pu.partie_id = $2`,
            [user_id, partie_id]
        );

        return result.rows[0];
    },

    async getAllScoresGroupedByPartie() {
        const result = await pool.query(
            `SELECT 
            pu.partie_id,
            p.name_partie,
            pu.user_id,
            u.name AS user_name,
            pu.score
            FROM parties_users pu
            JOIN users u ON pu.user_id = u.id
            JOIN parties p ON pu.partie_id = p.id
            ORDER BY pu.partie_id ASC`
        );

        return result.rows;
    },

    async getScoresGroupedByPartie() {
    const result = await pool.query(`
        SELECT 
        pu.partie_id,
        p.name_partie,
        pu.user_id,
        u.name AS user_name,
        pu.score
        FROM parties_users pu
        JOIN users u ON pu.user_id = u.id
        JOIN parties p ON pu.partie_id = p.id
        ORDER BY pu.partie_id ASC
    `);

    // On groupe par partie
    const grouped = {};

    result.rows.forEach(row => {
        const { partie_id, name_partie, user_id, user_name, score } = row;

        if (!grouped[partie_id]) {
        grouped[partie_id] = {
            partie_id,
            name_partie,
            scores: []
        };
        }

        grouped[partie_id].scores.push({ user_id, user_name, score });
    });

    return Object.values(grouped);
    },


    async postQuestionByPartieByUser(user_id, partie_id, question_id) {
        const result = await pool.query(
            `INSERT INTO parties_questions (user_id, partie_id, question_id)
            VALUES ($1, $2, $3)
            RETURNING *;`,
            [user_id, partie_id, question_id]
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
