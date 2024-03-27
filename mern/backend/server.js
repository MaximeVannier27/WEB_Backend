const express = require('express');
const mongoose = require('mongoose');
const Telecom = require('./model/Telecom');
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;
const router = express.Router();

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

router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let data = [];
let foundData; // Initialisez la variable foundData en dehors de la portée des routes

// Récupérer les données de la BDD au démarrage du serveur
async function fetchData() {
  try {
    data = await Telecom.find().select('-_id');
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
  }
}

// Appeler fetchData une fois au démarrage du serveur
fetchData();

// Tirer aléatoirement une personne dans la BDD
app.get('/telecom', async (req, res) => {
  try {
    if (data.length === 0) {
      throw new Error('Aucune donnée disponible');
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    const randomData = data[randomIndex];

    res.json(randomData);
  } catch (err) {
    console.error('Erreur lors de la récupération des données aléatoires :', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la récupération des données aléatoires' });
  }
});

router.post('/trigger', async (req, res) => {
  const action = req.body.trigger;
  console.log("Nom entré: " + action);
  try {
    switch (action) {
      case 'newgame':
        console.log("Lancement d'une nouvelle partie");
        break;
      case 'abandon':
        console.log('Langue au chat');
        break;
      default:
        foundData = data.find(item => item.Nom === action);
        console.log(foundData)
        if (!foundData) {
          console.error(`Aucune donnée trouvée avec le nom "${action}"`);
          return res.status(404).json({ error: `Aucune donnée trouvée avec le nom "${action}"` });
        }
        // Pas de retour de données ici
        return res.json({ success: true, message: "Action traitée avec succès" });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête :', error);
    return res.status(500).json({ error: 'Erreur lors du traitement de la requête' });
  }
});

router.get('/historique', async (req, res) => {
  try {
    if (!foundData) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    // Retournez les données trouvées ici
    return res.json(foundData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données historiques :', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des données historiques' });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
