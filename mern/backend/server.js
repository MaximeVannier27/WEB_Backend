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

app.use(express.json());

let data = [];

// Récupérer les données de la BDD
async function fetchData() {
  try {
    data = await Telecom.find().select('-_id');
    console.log('Données récupérées avec succès :', data);
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
  }
}

// Tirer aléatoirement une personne dans la BDD
app.get('/telecom', async (req, res) => {
  try {
    if (data.length === 0) {
      await fetchData();
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    const randomData = data[randomIndex];

    console.log('Donnée aléatoire récupérée avec succès :', randomData);
    res.json(randomData);
  } catch (err) {
    console.error('Erreur lors de la récupération des données aléatoires :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données aléatoires' });
  }
});

// Récupérer sur l'API du front (/api/trigger) le nom de la personne cliquée puis chercher ses infos et poster sur l'API /historique
app.post('/api/trigger', async (req, res) => {
  try {
    // Récupérer le nom depuis le corps de la requête POST
    const name = req.body.trigger;

    // Vérifier si le nom est présent dans le corps de la requête
    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis dans la requête' });
    }

    // Recherche dans les données
    const foundData = data.find(item => item.Nom === name);

    // Si aucune donnée n'est trouvée avec le nom spécifié, renvoyer une réponse 404
    if (!foundData) {
      return res.status(404).json({ error: `Aucune donnée trouvée avec le nom "${name}"` });
    }

    // Une fois que les données sont trouvées, les poster sur /historique
    // Pour l'instant, nous renvoyons simplement les données comme exemple
    res.status(200).json(foundData);
  } catch (err) {
    console.error('Erreur lors de la récupération du nom depuis le front-end :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du nom depuis le front-end' });
  }
});

// Endpoint pour poster les informations sur /historique
app.post('/historique', async (req, res) => {
  try {
    // Récupérer les informations depuis le corps de la requête POST
    const dataToPost = req.body;

    // Poster les informations sur /historique
    // Vous pouvez implémenter la logique appropriée ici, par exemple, enregistrer les données dans une base de données
    console.log('Données reçues :', dataToPost);
    res.status(200).json({ message: 'Données reçues avec succès sur /historique' });
  } catch (err) {
    console.error('Erreur lors de la récupération des données à poster sur /historique :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données à poster sur /historique' });
  }
});

// Route pour récupérer les informations depuis /historique
app.get('/historique', async (req, res) => {
  try {
    // Récupérer les informations depuis le corps de la requête POST
    const dataToPost = req.body;

    // Poster les informations sur /historique
    // Vous pouvez implémenter la logique appropriée ici, par exemple, enregistrer les données dans une base de données
    console.log('Données reçues :', dataToPost);
    res.status(200).json({ message: 'Données reçues avec succès sur /historique' });
  } catch (err) {
    console.error('Erreur lors de la récupération des données à poster sur /historique :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données à poster sur /historique' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
