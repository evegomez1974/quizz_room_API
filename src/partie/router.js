const express = require('express');
const router = express.Router();
const Partie = require('./service');

// Créer une partie
router.post('/partie', async (req, res) => {
  const { name_partie, score_partie } = req.body;
  console.log( name_partie, score_partie)
  if (!name_partie) {
    return res.status(400).json({ error: 'name_partie et score_partie sont requis' });
  }

  try {
    const partie = await Partie.createPartie(name_partie, score_partie);
    res.status(201).json(partie);
  } catch (error) {
    console.error('Erreur createPartie:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir toutes les parties
router.get('/parties', async (req, res) => {
  try {
    const parties = await Partie.getAllParties();
    res.json(parties);
  } catch (error) {
    console.error('Erreur getAllParties:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir une partie par ID
router.get('/parties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const partie = await Partie.getPartieById(id);
    if (!partie) {
      return res.status(404).json({ error: 'Partie non trouvée' });
    }
    res.json(partie);
  } catch (error) {
    console.error('Erreur getPartieById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour une partie
  router.put('/parties/:id', async (req, res) => {
    const { id } = req.params;
    const { name_partie, score_partie } = req.body;

    if (!name_partie || score_partie === undefined) {
      return res.status(400).json({ error: 'name_partie et score_partie sont requis' });
    }

    try {
      const partie = await Partie.updatePartie(id, name_partie, score_partie);

      if (!partie) {
        return res.status(404).json({ error: 'Partie non trouvée' });
      }

      res.json(partie);
    } catch (error) {
      console.error('Erreur updatePartie:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
});


// Supprimer une partie
router.delete('/parties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Partie.deletePartie(id);
    res.json(result);
  } catch (error) {
    console.error('Erreur deletePartie:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
