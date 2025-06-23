const express = require('express');
const router = express.Router();
const Question = require('./service');

// Créer une question
router.post('/questions', async (req, res) => {
  const { titre, label, points } = req.body;

  if (!titre || !label || !points) {
    return res.status(400).json({ error: 'titre, label et points sont requis' });
  }

  try {
    const question = await Question.createQuestion(titre, label, points);
    res.status(201).json(question);
  } catch (error) {
    console.error('Erreur createQuestion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un théme à une question
router.post('/themes/:themeId/questions/:questionId', async (req, res) => {
  const { themeId, questionId } = req.params;

  try {
    const link = await Service.addQuestionToTheme(themeId, questionId);
    res.status(201).json(link);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la question au thème :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Obtenir toutes les questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.getAllQuestions();
    res.json(questions);
  } catch (error) {
    console.error('Erreur getAllQuestions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir une question par ID
router.get('/questions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.getQuestionById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    res.json(question);
  } catch (error) {
    console.error('Erreur getQuestionById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupére la liste de questions par thème
router.get('/themes/:id/questions', async (req, res) => {
  const themeId = req.params.id;

  try {
    const questions = await Service.getQuestionsByTheme(themeId);
    res.json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions par thème :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour une question
router.put('/questions/:id', async (req, res) => {
  const { id } = req.params;
  const { titre, label, points } = req.body;

  if (!titre || !label || !points) {
    return res.status(400).json({ error: 'titre, label et points sont requis' });
  }

  try {
    const question = await Question.updateQuestion(id, titre, label, points);
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }
    res.json(question);
  } catch (error) {
    console.error('Erreur updateQuestion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une question
router.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Question.deleteQuestion(id);
    res.json(result);
  } catch (error) {
    console.error('Erreur deleteQuestion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
