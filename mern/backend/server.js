// server.js

// first we import our dependencies…
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Comment = require("./model/comment");

// and create our instances
const app = express();
const router = express.Router();

const info_joueur = {
    "Nom" : false,
    "Photo": false,
    "Genre" : false,
    "Siècle" : false,
    "MBTI" : false,
    "Animal" : false,
    "Formation" : false,
    "Récompense" : false,
    "Nationalité" : false,
    "Domaine" : false
}

const dico_test1 = {
    "Nom" : "Albert Einstein",
    "Photo": "AE",
    "Genre" : "M",
    "Siècle" : "20",
    "MBTI" : "INTP",
    "Animal" : "Chat",
    "Formation" : "Polytechnique",
    "Récompense" : "Prix Nobel",
    "Nationalité" : "Allemande/Américaine",
    "Domaine" : "Physique"
}

const dico_test2 = {
    "Nom" : "Albert Einstein",
    "Photo": "",
    "Genre" : "",
    "Siècle" : "20",
    "MBTI" : "INTP",
    "Animal" : "",
    "Formation" : "Polytechnique",
    "Récompense" : "Prix Nobel",
    "Nationalité" : "Américaine",
    "Domaine" : ""
}

const dico_test3 = {
    "Nom" : "",
    "Photo": "",
    "Genre" : "",
    "Siècle" : "",
    "MBTI" : "",
    "Animal" : "",
    "Formation" : "",
    "Récompense" : "",
    "Nationalité" : "Allemande",
    "Domaine" : ""
}

// function of comparaison
function compareInfo(dict1, dict2) {
    for (let key in dict1) {
        if (dict1[key].includes('/')) {
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
            if (dict2[key].includes('/')) {
                let element = dict2.split('/');
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

console.log("Nom entré: " + action);
res.json({ success: true, message: action });

switch (action) {
    case 'newgame':
        console.log("Lancement d'une nouvelle partie");
        break;
    case 'abandon':
        console.log('Langue au chat');
        break;

    default:
        console.log('Comparaison avec' + action);
        const comparisonResult = compareInfo(dic1, dic2);
        let responseData = {success: true, etatDuJeu: comparisonResult};
        res.json(responseData);
}
});

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));

compareInfo(dico_test1,dico_test2);
console.log(info_joueur);
compareInfo(dico_test1,dico_test3);
console.log(info_joueur);
