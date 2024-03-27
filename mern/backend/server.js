// server.js

// first we import our dependencies…
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Comment = require("./model/comment");

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
        // choix random Perso
        //+1 dans la base de données à Statistiques.Statistiques[Nom_Du_Prof][Tirages]

        let recurrence = 0;
        let essais = 0;
        let stats = {"nom": "", "moyenne":0};
        let stats_triees = [];
        let stats_envoi = {"meilleur": [], "pire":[]};

        for (const i in Statistiques.Statistiques) {
          stats["nom"] = i["nom"];
          stats["moyenne"] = i["Trouvé"]/i["Tirages"];
          if (stats_triees.length==0) {
            stats_triees.push(stats)
          } else {
            for (let j = 0; j<stats_triees.length; j++) {
              if (stats["moyenne"]<=stats_triees[j]["moyenne"] || j==stats_triees.length-1) {
                stats_triees.splice(j,0,stats);
                break;
              }
            }
          }
        }

        for (let i = 0; i<5;i++) {
          stats_envoi["meilleur"].push(stats_triees[i]);
          stats_envoi["pire"].push(stats_triees[stats_triees.length-i]);
        }
        
        //envoi au front de stats_envoi

        break;
    case 'abandon':
        console.log('Langue au chat');
        break;

    default:
        console.log('Comparaison avec' + action);
        compteur_essai += 1;
        if (dic1["Nom"]==dic2["Nom"]) {
          //+compteur_essai dans la base de données à Statistiques.Statistiques[Nom_Du_Prof][Trouvé]
        }
        const comparisonResult = compareInfo(dic1, dic2);
        let responseData = {"success": true, "etatDuJeu": comparisonResult};
        res.json(responseData);
}
});

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
