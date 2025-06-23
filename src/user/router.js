const express = require('express');
const router = express.Router();
const User = require('./service'); 

// Créer un nouvel utilisateur
router.post('/user', async (req, res) => {
  const { name, role_id, buzzer_id } = req.body;

  if (!name || !role_id ) {
    return res.status(400).json({ error: 'name et role_id sont requis' });
  }

  try {
    const newUser = await User.createUser(name, role_id, buzzer_id);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erreur createUser:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un utilisateur par id
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur getUserById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un utilisateur par id et role_id
router.get('/user/:id/role/:role_id', async (req, res) => {
  const { id, role_id } = req.params;

  try {
    const user = await User.getUserByIdByRole(id, role_id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé avec ce rôle' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur getUserByIdByRole:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un utilisateur
router.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role_id, buzzer_id } = req.body;

  if (!name || !role_id) {
    return res.status(400).json({ error: 'name et role_id sont requis' });
  }

  try {
    const updatedUser = await User.updateUser(name, role_id, buzzer_id, id);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un utilisateur
router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await User.deleteUser(id);
    res.json(result);
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
