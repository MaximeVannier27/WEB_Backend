// server.js

// first we import our dependencies…
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Statistique = require("./model/schema_stat");

// and create our instances
const app = express();
const router = express.Router();

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

const updateStat = async (nom,clé,val) => {
  try {
    let stat = await Statistique.findOne({ Nom: nom });
    stat.clé += val;
    await stat.save();
  } catch (error) {
    console.error("Une erreur s'est produite lors de la mise à jour de la BDD/STATISTIQUES:", error);
  }
};

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

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;

mongoose.connect("mongodb://localhost:3010/");
var db = mongoose.connection;
db.on('error', () => console.error('Erreur de connexion'));

// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// now we can set the route path & initialize the API
router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// router.get('/comments', (req, res) => {
//     Comment.find()
//       .then(comments => {
//         res.json({ success: true, data: comments });
//       })
//       .catch(err => {
//         res.json({ success: false, data: { error: err } });
//       });
//   });


router.post('/trigger', (req, res) => {
    const action = req.body.trigger;
    let compteur_essai = 0;

    console.log("Nom entré: " + action);
    res.json({ success: true, message: action });

    switch (action) {
        case 'newgame':
            console.log("Lancement d'une nouvelle partie");
            compteur_essai = 0;

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

                console.log(stats_envoi);
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
            console.log('Comparaison avec' + action);
            compteur_essai += 1;
            if (dic1["Nom"]==dic2["Nom"]) {
              updateStat(dic1["Nom"],Trouvé,compteur_essai)
              updateStat(dic1["Nom"],Tirages,1)
            }
            const comparisonResult = compareInfo(dic1, dic2);
            let responseData = {"success": true, "etatDuJeu": comparisonResult};
            res.json(responseData);
}
});

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));

