const express = require('express');
const router = express.Router();
const Theme = require('./service'); 

// Créer un thème
router.post('/themes', async (req, res) => {
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ error: 'Le label est requis' });
  }

  try {
    const theme = await Theme.createTheme(label);
    res.status(201).json(theme);
  } catch (error) {
    console.error('Erreur createTheme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer tous les thèmes
router.get('/themes', async (req, res) => {
  try {
    const themes = await Theme.getAllThemes();
    res.json(themes);
  } catch (error) {
    console.error('Erreur getAllThemes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un thème par ID
router.get('/themes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const theme = await Theme.getThemeById(id);
    if (!theme) {
      return res.status(404).json({ error: 'Thème non trouvé' });
    }
    res.json(theme);
  } catch (error) {
    console.error('Erreur getThemeById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modifier un thème
router.put('/themes/:id', async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ error: 'Le label est requis' });
  }

  try {
    const updated = await Theme.updateTheme(id, label);
    if (!updated) {
      return res.status(404).json({ error: 'Thème non trouvé' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erreur updateTheme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un thème
router.delete('/themes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Theme.deleteTheme(id);
    res.json(result);
  } catch (error) {
    console.error('Erreur deleteTheme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
