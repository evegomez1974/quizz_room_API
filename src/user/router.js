const express = require('express');
const router = express.Router();
const User = require('./service'); 
const Partie = require('../partie/service'); 

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

// Ajout du score d'une partie avec le user gagnant
router.post('/parties/scores', async (req, res) => {
  const { user_id, partie_id, score } = req.body;

  if (!user_id || !partie_id || score === undefined) {
    return res.status(400).json({ error: 'user_id, partie_id et score sont requis' });
  }

  try {
    const result = await User.resultPartie(user_id, partie_id, score);

    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du score gagnant :', error);
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

// Récupére le user qui a rep a une question dans une partie
router.get('/parties/:partieId/questions/:questionId/user', async (req, res) => {
  const { partieId, questionId } = req.params;
  try {
    const userId = await User.getUserByPartieAndQuestion(partieId, questionId);
    if (!userId) {
      return res.status(404).json({ error: 'Aucun utilisateur trouvé pour cette partie et question' });
    }
    res.json({ userId });
  } catch (error) {
    console.error('Erreur getUserByPartieAndQuestion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Récupération du score d'un user pour une partie
router.get('/users/:user_id/parties/:partie_id/score', async (req, res) => {
  const { user_id, partie_id } = req.params;

  try {
    const result = await User.getUserScoreForPartie(user_id, partie_id);
    if (!result) {
      return res.status(404).json({ error: 'Aucun score trouvé pour cet utilisateur dans cette partie' });
    }
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération du score:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Récupération du score des users d'une partie
router.get('/users/parties/:partie_id/score', async (req, res) => {
  const { partie_id } = req.params;

  try {
    const result = await User.getUsersScoreForPartie(partie_id);

    if (!result || result.length === 0) {
      // supp partie
      await Partie.deletePartie(partie_id);
      return res.status(204).json({ message: 'Partie supprimée car aucun score' });
    }
console.log("ici : " + result)
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération du score :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Récupéaration des scores de tous les users pour toutes les parties
router.get('/scores', async (req, res) => {
  try {
    const scores = await User.getAllScoresGroupedByPartie();
    res.json(scores);
  } catch (error) {
    console.error('Erreur lors de la récupération des scores:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// // Récupéaration de tous les scores des joueurs pour une partie
// router.get('/scores/grouped/partie/:partieId', async (req, res) => {
//   try {
//     const groupedScores = await User.getScoresGroupedByPartie();
//     res.json(groupedScores);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des scores groupés:', error);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });

// Ajout le user qui a rep a une question dans une partie
router.post('/parties/:partieId/questions/:questionId/user/:userId', async (req, res) => {
  try {
    const { partieId, questionId, userId } = req.params;


    if (!userId || !partieId || !questionId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    const result = await User.postQuestionByPartieByUser(userId, partieId, questionId);
    return res.status(201).json({ message: 'Insertion réussie', data: result });
  } catch (error) {
    console.error('Erreur insertion parties_questions:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
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
