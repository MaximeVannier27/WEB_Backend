const express = require('express');
const mongoose = require('mongoose');
const Telecom = require('./model/Telecom');

const app = express();
const PORT = 3001;

mongoose.connect('mongodb://localhost:3010/Telecom', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connexion à la base de données réussie');
})
.catch((err) => {
  console.error('Erreur lors de la connexion à la base de données :', err);
});

// Route pour récupérer toutes les données de la base de données
app.get('/telecom', async (req, res) => {
  try {
    const data = await Telecom.find().select('-_id');
    console.log('Données récupérées avec succès :', data);
    res.json(data);
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Route pour récupérer un élément aléatoire de la base de données
app.get('/random', async (req, res) => {
  try {
    const data = await Telecom.aggregate([{ $sample: { size: 1 } }, { $project: { _id: 0 } }]);
    const randomData = data[0];
    console.log('Donnée aléatoire récupérée avec succès :', randomData);
    res.json(randomData);
  } catch (err) {
    console.error('Erreur lors de la récupération des données aléatoires :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données aléatoires' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
