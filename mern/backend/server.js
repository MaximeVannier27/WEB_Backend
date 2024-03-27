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

// Fonction de comparaison
function compareInfo(dict1, dict2) {
  const res = {};
  for (let key in dict1) {
    // Vérifie si les valeurs sont identiques
    res[key] = dict1[key] === dict2[key];
  }
  return res;
}

// Route POST pour le déclencheur
router.post('/trigger', async (req, res) => {
  const action = req.body.trigger;
  console.log("Nom entré: " + action);
  res.json({ success: true, message: action });
  try {
    switch (action) {
      case 'newgame':
        console.log("Lancement d'une nouvelle partie");
        break;
      case 'abandon':
        console.log('Langue au chat');
        break;
      default:
        ////console.log('Comparaison avec ' + action);
        const foundData = data.find(item => item.Nom === action);
        if (!foundData) {
          console.error(`Aucune donnée trouvée avec le nom "${action}"`);
          res.status(404).json({ error: `Aucune donnée trouvée avec le nom "${action}}"` });
          return;
        }
        ///const comparisonResult = compareInfo(foundData, foundData); // Utilisation de foundData pour dic1 et dic2
        ///console.log('Résultat de la comparaison :', comparisonResult);
        envoiInfos(foundData);
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête :', error);
    res.status(500).json({ error: 'Erreur lors du traitement de la requête' });
  }
});

// Fonction pour envoyer les informations à l'historique
async function envoiInfos(message) {
  try {
    const response = await fetch("/historique", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ historique: message })
    });

    if (!response.ok) {
      throw new Error('Erreur réseau');
    }
    console.log('Envoi sur l API réussi');
  } catch (error) {
    console.error('Il y a eu une erreur lors du fetch:', error);
    throw error; // Relancez l'erreur pour la capturer dans le routeur POST
  }
}

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
