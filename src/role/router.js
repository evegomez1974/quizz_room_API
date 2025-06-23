const express = require('express');
const router = express.Router();
const Role = require('./service'); 

// Créer un rôle
router.post('/roles', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  try {
    const role = await Role.createRole(name);
    res.status(201).json(role);
  } catch (error) {
    console.error('Erreur createRole:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir tous les rôles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error('Erreur getAllRoles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir un rôle par ID
router.get('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.getRoleById(id);
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }
    res.json(role);
  } catch (error) {
    console.error('Erreur getRoleById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un rôle
router.put('/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  try {
    const role = await Role.updateRole(id, name);
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }
    res.json(role);
  } catch (error) {
    console.error('Erreur updateRole:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un rôle
router.delete('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Role.deleteRole(id);
    res.json(result);
  } catch (error) {
    console.error('Erreur deleteRole:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
