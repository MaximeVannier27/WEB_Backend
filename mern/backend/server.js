const express = require('express');
const mongoose = require('mongoose');
const Personnage = require('./model/schema_personnage');
const Statistique = require('./model/schema_stat')
const bodyParser = require("body-parser");

const app = express();
const PORT = 3001;
const router = express.Router();

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;
let dataPerso = {}
let historique = []
let statFinal = {}
let info_joueur = {
  "Nom": false,
  "Sexe": false,
  "Animal": false,
  "MBTI": false,
  "Siecle": false,
  "Nationalite": false,
  "Domaine": false,
  "Formation": false,
  "Recompense": false,
  "Image": false,
  "Funfact": false,
}
let compteur_essai = 0;
let liste_perso_globale = [];

mongoose.connect("mongodb://localhost:3010/Donnees");
var db = mongoose.connection;
db.on('error', () => console.error('Erreur de connexion'));

// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// function of comparaison
function compareInfo(dict1, dict2) {
    for (let key in dict1) {
        if (key === "Nationalite" && dict1[key].includes('/')) {
            if (dict2[key].includes('/')) {
                let element = dict2[key].split('/');
                for (let elements in element) {
                    if (dict1[key].includes(elements) && (!(info_joueur[key]) || !(info_joueur[key].includes(elements)))) {
                        if ((info_joueur[key]) && info_joueur[key].includes('/')) {
                            info_joueur[key] = info_joueur[key]+elements;
                        }
                        else {
                            info_joueur[key] = elements + '/';
                        }
                    }
                }
            }
            else {
                if (dict1[key].includes(dict2[key]) && (!(info_joueur[key]) || !(info_joueur[key].includes(dict2[key])))) {
                    if ((info_joueur[key]) && info_joueur[key].includes('/')) {
                        info_joueur[key] = info_joueur[key]+dict2[key];
                    }
                    else {
                        info_joueur[key] = dict2[key] + '/';
                    }
                }
            }
        }
        else {
            if (key == "Nationalite" && dict2[key].includes('/')) {
                let element = dict2[key].split('/');
                for (let elements in element) {
                    if (elements == dict1[key]) {
                        info_joueur[key] = dict1[key];
                    }
                }
            }
            else {
                if (dict2[key] == dict1[key]) {
                    info_joueur[key] = dict1[key];
                }
            }
        }
        
    }
    return;
}

async function getDocumentsAsDictionary(schema) {
  try {
    const documents = await schema.find({});
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

const updateStatTrouve = async (nom,val) => {
  try {
    let stat = await Statistique.findOne({ Nom: nom });
    stat.Trouvé += val;
    await stat.save();
  } catch (error) {
    console.error("Une erreur s'est produite lors de la mise à jour de la BDD/STATISTIQUES:", error);
  }
};

const updateStatTirage = async (nom,val) => {
  try {
    let stat = await Statistique.findOne({ Nom: nom });
    stat.Tirage += val;
    await stat.save();
  } catch (error) {
    console.error("Une erreur s'est produite lors de la mise à jour de la BDD/STATISTIQUES:", error);
  }
};

router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

router.post('/trigger', async (req, res) => {
    const action = req.body.trigger;
    console.log("Nom entré: " + action);
    res.json({ success: true, message: action });
    let data = await getDocumentsAsDictionary(Personnage)

    switch (action) {
        case 'newgame':
            console.log("Lancement d'une nouvelle partie");
            compteur_essai = 0;
            let dataPerso_temp = randomData(data);
            delete dataPerso_temp._id
            dataPerso = dataPerso_temp
            console.log("DATA perso")
            console.log(dataPerso)
            info_joueur = {
              "Nom": false,
              "Sexe": false,
              "Animal": false,
              "MBTI": false,
              "Siecle": false,
              "Nationalite": false,
              "Domaine": false,
              "Formation": false,
              "Recompense": false,
              "Image": false,
              "Funfact": false,
            };
            
            (async () => {
              try {
                const dictionary = await getDocumentsAsDictionary(Statistique);
                let stats_triees = [];
                let stats_envoi = { "pire": [], "meilleur": [] };

                for (const key in dictionary) {
                  const doc = dictionary[key];
                  const nom = doc.Nom;
                  liste_perso_globale.push(nom);
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
          liste_perso_globale.splice(liste_perso_globale.indexOf(action),1);
          let foundData = {};
          for (const key in data) {
            let doc = data[key];
            if (doc.Nom==action) {
              foundData = doc;
              break;
            }
          }
          delete foundData._id
          historique.push(foundData)
          if (!foundData) {
            console.error(`Aucune donnée trouvée avec le nom "${action}"`);
            return res.status(404).json({ error: `Aucune donnée trouvée avec le nom "${action}"` });
          }
          console.log('Comparaison avec ' + action);
          compteur_essai += 1;
          if (dataPerso["Nom"]==foundData["Nom"]) {
            updateStatTrouve(dataPerso["Nom"],compteur_essai)
            updateStatTirage(dataPerso["Nom"],1)
          }
          console.log("Pas la bonne personne")
          compareInfo(dataPerso, foundData);
          console.log(info_joueur)
          return ;
}
});

// Use our router configuration when we call /api
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// // Récupérer les données de la BDD au démarrage du serveur
// async function fetchData() {
//   try {
//     data = await Personnage.find().select('-_id');
//     return data
//   } catch (err) {
//     console.error('Erreur lors de la récupération des données :', err);
//   }
// }

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
  let randomIndex = Math.floor(Math.random() * Object.keys(data).length);
  console.log(randomIndex)
  let randomKey = Object.keys(data)[randomIndex]
  console.log(randomKey)
  let randomData = data[randomKey];
  return randomData
}



app.get('/historique', async (req, res) => {
  try {
    if (!foundData) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    // Retournez les données trouvées ici
    console.log("je suis passé dans l'historique")
    return res.json(historique);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des données historiques' });
  }
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
});

router.get('/affichage', async (req, res) => {
  try {
    if (!info_joueur) {
      return res.status(404).json({ error : "Pas d'affichage trouvé"});
    }
    return res.json(info_joueur);
  } catch (error) {
    console.error("Erreur lors de la récupération des données d'affichage :", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des données d'affichage" });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

