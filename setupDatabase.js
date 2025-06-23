require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

// Liste des tables à créer
const createTables = `

CREATE TABLE IF NOT EXISTS buzzers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    label VARCHAR(1000) NOT NULL,
    points VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    name_partie VARCHAR(100) NOT NULL,
    score_partie VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    buzzer_id INTEGER REFERENCES buzzers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parties_users (
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    partie_id INTEGER REFERENCES parties(id) ON DELETE SET NULL,
    score VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parties_questions (
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    partie_id INTEGER REFERENCES parties(id) ON DELETE SET NULL,
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions_themes (
    theme_id INTEGER REFERENCES themes(id) ON DELETE SET NULL,
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


`;

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connexion à PostgreSQL réussie");

    await client.query(createTables);
    console.log("Tables créées avec succès");

  } catch (err) {
    console.error("Erreur lors de l'exécution du script:", err);
  } finally {
    await client.end();
    console.log("Connexion fermée");
  }
}

setupDatabase();
