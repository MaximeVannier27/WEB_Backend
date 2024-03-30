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
let liste_noms_temp = []
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
        if (key == "Nationalite" && dict1[key].includes('/')) {
            if (dict2[key].includes('/')) {
                let element = dict2[key].split('/');
                for (let elements in element) {
                    if (dict1[key].includes(element[elements]) && (!(info_joueur[key]) || !(info_joueur[key].includes(element[elements])))) {
                        if ((info_joueur[key]) && info_joueur[key].includes('/')) {
                            info_joueur[key] = info_joueur[key]+element[elements];
                        }
                        else {
                            info_joueur[key] = element[elements] + '/';
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
                    if (element[elements] == dict1[key]) {
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

async function getAllCharacterNames(schema) {
  try {
    const documents = await schema.find({});
    const names = documents.map(doc => doc.Nom); // Extracting only the 'Nom' field
    return names;
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
    stat.Tirages += val;
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
    const liste_noms_complete = await getAllCharacterNames(Personnage);
    
    switch (action) {
        case 'newgame':
            console.log("Lancement d'une nouvelle partie");
            compteur_essai = 0;
            let dataPerso_temp = randomData(data);
            delete dataPerso_temp._id
            dataPerso = dataPerso_temp
            console.log(dataPerso);
            // Mettre à jour la liste de noms complète
            liste_noms_temp = liste_noms_complete;
            historique = []
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
                  stats_triees.push({ "nom": nom, "moyenne":moyenne });
                }

                stats_triees.sort((a, b) => b.moyenne - a.moyenne);

                stats_envoi.pire = stats_triees.slice(0, 5);
                stats_envoi.meilleur = stats_triees.slice(-5);

                statFinal = stats_envoi
              } catch (error) {
                console.error("Erreur lors de la récupération des documents :", error);
              }
            })();
            

            break;
        case 'abandon':
            console.log('Langue au chat');
            info_joueur=dataPerso;
            liste_noms_temp = []
            break;

        default:
          liste_perso_globale.splice(liste_perso_globale.indexOf(action),1);
          let foundData = {};
          for (const key in data) {
            let doc = data[key];
            if (doc.Nom==action)
            if (doc.Nom==action) {
              foundData = doc;
              break;
            }
          }
          
          delete foundData._id
          historique.push(foundData)
          let liste_noms_temp_1 = liste_noms_temp.filter(element => element !== action);
          liste_noms_temp = liste_noms_temp_1;
          if (!foundData) {
            console.error(`Aucune donnée trouvée avec le nom "${action}"`);
            return res.status(404).json({ error: `Aucune donnée trouvée avec le nom "${action}"` });
          }
          compteur_essai += 1;
          if (dataPerso["Nom"]==foundData["Nom"]) {
            updateStatTrouve(dataPerso["Nom"],compteur_essai)
            updateStatTirage(dataPerso["Nom"],1)
            info_joueur = dataPerso;
          }
          else {
            console.log("Pas la bonne personne")
            compareInfo(dataPerso, foundData);
            // Mettre à jour la liste de noms temporaire après la comparaison
            
            console.log(info_joueur)
          }
          return ;
}
});

// // Use our router configuration when we call /api
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

router.get('/historique', (req, res) => {
    return res.json(historique);
});

router.get('/noms', (req, res) => {
  ///console.log("je suis dans les noms")
  ///console.log(liste_noms_temp);
  return res.json(liste_noms_temp);
});

router.get('/statistiques', (req, res) => {
    return res.json(statFinal);
});

router.get('/affichage', (req, res) => {
    return res.json(info_joueur);
});

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
      stats_triees.push({ "nom": nom, "moyenne":moyenne });
    }

    stats_triees.sort((a, b) => b.moyenne - a.moyenne);

    stats_envoi.pire = stats_triees.slice(0, 5);
    stats_envoi.meilleur = stats_triees.slice(-5);

    statFinal = stats_envoi
  } catch (error) {
    console.error("Erreur lors de la récupération des documents :", error);
  }
})();

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});