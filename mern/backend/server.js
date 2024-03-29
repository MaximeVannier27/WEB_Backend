const express = require('express');
const mongoose = require('mongoose');
const Telecom = require('./model/Telecom');
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;
const router = express.Router();

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;
const dataPerso = {}
const historique = []
const statFinal = {}

mongoose.connect("mongodb://localhost:3010/");
var db = mongoose.connection;
db.on('error', () => console.error('Erreur de connexion'));

// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// now we can set the route path & initialize the API
// function of comparaison
function compareInfo(dict1, dict2) {
    res = {}
    for (let key in dict1) {
      // Check if their values are same
      if (dict2[key] == dict1[key]) {
        res[key] = dict1[key];
      } else {
        res[key] = false;
      }
    }
    return res;
}

async function getDocumentsAsDictionary() {
  try {
    const documents = await Statistique.find({});
    const dictionary = {};
    documents.forEach(doc => {
      dictionary[doc._id.toString()] = doc.toObject();
    });
    return dictionary;
  } catch (error) {
    console.error('Erreur :', error);
    throw error;
  }
}

const updateStat = async (nom,clé,val) => {
  try {
    let stat = await Statistique.findOne({ Nom: nom });
    stat.clé += val;
    await stat.save();
  } catch (error) {
    console.error("Une erreur s'est produite lors de la mise à jour de la BDD/STATISTIQUES:", error);
  }
};

router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

router.post('/trigger', (req, res) => {
    const action = req.body.trigger;
    let compteur_essai = 0;

    console.log("Nom entré: " + action);
    res.json({ success: true, message: action });
    let data = fetchData()
    switch (action) {
        case 'newgame':
            console.log("Lancement d'une nouvelle partie");
            compteur_essai = 0;
            dataPerso = randomData(data)
            //choix random de la personnalité
            // création de dic1 à partir de la BDD
            
            (async () => {
              try {
                const dictionary = await getDocumentsAsDictionary();
                let stats_triees = [];
                let stats_envoi = { "pire": [], "meilleur": [] };

                for (const key in dictionary) {
                  const doc = dictionary[key];
                  const nom = doc.Nom;
                  const moyenne = Math.round(doc.Trouvé / doc.Tirages);
                  stats_triees.push({ nom, moyenne });
                }

                stats_triees.sort((a, b) => b.moyenne - a.moyenne);

                stats_envoi.pire = stats_triees.slice(0, 5);
                stats_envoi.meilleur = stats_triees.slice(-5);

                statFinal = stats_envoi
              } catch (error) {
                console.error("Erreur lors de la récupération des documents :", error);
              }
            })();
            
            //envoi au front de stats_envoi

            break;
        case 'abandon':
            console.log('Langue au chat');
            break;

        default:
          let foundData = data.find(item => item.Nom === action);
          historique.push(foundData)
          console.log(foundData)
          if (!foundData) {
            console.error(`Aucune donnée trouvée avec le nom "${action}"`);
            return res.status(404).json({ error: `Aucune donnée trouvée avec le nom "${action}"` });
          }
          console.log('Comparaison avec' + action);
          compteur_essai += 1;
          if (dataPerso["Nom"]==foundData["Nom"]) {
            updateStat(dataPerso["Nom"],Trouvé,compteur_essai)
            updateStat(dataPerso["Nom"],Tirages,1)
          }
          const comparisonResult = compareInfo(dataPerso, foundData);
          let responseData = {"success": true, "etatDuJeu": comparisonResult};
          res.json(responseData);
          return res.json({ success: true, message: "Action traitée avec succès" });
}
});

// Use our router configuration when we call /api
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Récupérer les données de la BDD au démarrage du serveur
async function fetchData() {
  try {
    data = await Telecom.find().select('-_id');
    return data
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
  }
}

// Appeler fetchData une fois au démarrage du serveur

// Tirer aléatoirement une personne dans la BDD
// app.get('/telecom', async (req, res) => {
//   try {
//     if (data.length === 0) {
//       throw new Error('Aucune donnée disponible');
//     }

//     const randomIndex = Math.floor(Math.random() * data.length);
//     const randomData = data[randomIndex];
//     // dict1 = randomData

//     res.json(randomData);
//   } catch (err) {
//     console.error('Erreur lors de la récupération des données aléatoires :', err);
//     res.status(500).json({ error: err.message || 'Erreur lors de la récupération des données aléatoires' });
//   }
// });

function randomData(data) {
  if (data.length === 0) {
    throw new Error('Aucune donnée disponible');
  }

  let randomIndex = Math.floor(Math.random() * data.length);
  let randomData = data[randomIndex];
  return randomData
}



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

router.get('/statistiques', async (req, res) => {
  try {
    if (!statFinal) {
      return res.status(404).json({ error : 'Pas de stat trouvée'});
    }
    return res.json(statFinal);
  } catch (error) {
    console.error('Erreur lors de la récupération des données statistiques :', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des données statistiques' });
  }
})
