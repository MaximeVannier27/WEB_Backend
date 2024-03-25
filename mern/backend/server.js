const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const app = express();
const PORT = 3001;

// Connexion à la base de données MongoDB
mongoose.connect("mongodb://localhost:3010/Telecom", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch(err => console.error('Erreur lors de la connexion à la base de données :', err));

// Schéma pour les données de télécommunication
const telecomSchema = new Schema({
  name: String,
  type: String,
  // Ajoutez d'autres champs si nécessaire
});

// Modèle de données de télécommunication
const Telecom = mongoose.model('Telecom', telecomSchema);

let telecomData = [];

// Fonction pour récupérer la base de données et la stocker dans la variable telecomData
async function fetchTelecomData() {
  try {
    telecomData = await Telecom.find().select('-_id');
    console.log('Données récupérées avec succès :', telecomData);
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
  }
}

// Route pour récupérer un élément aléatoire de la base de données et le poster sur l'URL
app.get('/telecom', async (req, res) => {
  try {
    // Vérifier si la base de données a déjà été récupérée, sinon la récupérer
    if (telecomData.length === 0) {
      await fetchTelecomData();
    }

    // Choisir un élément aléatoire dans la base de données
    const randomIndex = Math.floor(Math.random() * telecomData.length);
    const randomTelecom = telecomData[randomIndex];

    res.json(randomTelecom);
  } catch (err) {
    console.error('Erreur lors de la récupération des données aléatoires :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données aléatoires' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
