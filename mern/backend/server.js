const express = require('express');
const mongoose = require('mongoose');
const Telecom = require('./model/Telecom'); // Assurez-vous de spécifier le bon chemin

const app = express();
const PORT = 3001;

mongoose.connect("mongodb://localhost:3010/Telecom", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch(err => console.error('Erreur lors de la connexion à la base de données :', err));

let telecomData = [];

async function fetchTelecomData() {
  try {
    telecomData = await Telecom.find().select('-_id');
    console.log('Données récupérées avec succès :', telecomData);
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
  }
}

app.get('/telecom', async (req, res) => {
  try {
    if (telecomData.length === 0) {
      await fetchTelecomData();
    }

    const randomIndex = Math.floor(Math.random() * telecomData.length);
    const randomTelecom = telecomData[randomIndex];

    console.log('Donnée aléatoire récupérée avec succès :', randomTelecom);
    res.json(randomTelecom);
  } catch (err) {
    console.error('Erreur lors de la récupération des données aléatoires :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données aléatoires' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
