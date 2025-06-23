const express = require('express');
const router = express.Router();
const Buzzer = require('./service'); 

// Créer un buzzer
router.post('/buzzers', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  try {
    const buzzer = await Buzzer.createBuzzer(name);
    res.status(201).json(buzzer);
  } catch (error) {
    console.error('Erreur createBuzzer:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir tous les buzzers
router.get('/buzzers', async (req, res) => {
  try {
    const buzzers = await Buzzer.getAllBuzzers();
    res.json(buzzers);
  } catch (error) {
    console.error('Erreur getAllBuzzers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir un buzzer par ID
router.get('/buzzers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const buzzer = await Buzzer.getBuzzerById(id);
    if (!buzzer) {
      return res.status(404).json({ error: 'Buzzer non trouvé' });
    }
    res.json(buzzer);
  } catch (error) {
    console.error('Erreur getBuzzerById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un buzzer
router.put('/buzzers/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  try {
    const buzzer = await Buzzer.updateBuzzer(id, name);
    if (!buzzer) {
      return res.status(404).json({ error: 'Buzzer non trouvé' });
    }
    res.json(buzzer);
  } catch (error) {
    console.error('Erreur updateBuzzer:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un buzzer
router.delete('/buzzers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Buzzer.deleteBuzzer(id);
    res.json(result);
  } catch (error) {
    console.error('Erreur deleteBuzzer:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
