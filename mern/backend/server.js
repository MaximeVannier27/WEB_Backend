// server.js

// first we import our dependencies…
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Comment = require("./model/comment");

// and create our instances
const app = express();
const router = express.Router();

// create the person to be guessed
let personGuess = {};

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;

mongoose.connect("mongodb://localhost:3010/");
var db = mongoose.connection;
db.on('error', () => console.error('Erreur de connexion'));

// get the infos of a person randomly
db.once('open', async () => {
    try {
        const randomPerson = await Comment.findOne().skip(Math.floor(Math.random() * await Comment.countDocuments()));
        if (randomPerson) {
            personGuess[randomPerson.name] = randomPerson.personalInfo;
            console.log("Global data initialized with random person's information.");
        } else {
            console.log("No person found in the database.");
        }
    } catch (error) {
        console.error("Error occurred while initializing global data:", error);
    }
});

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
        // search for all personal information corresponding to the name matching the action value in the database
        Comment.find({ name: action })
        .then(persons => {
            if (persons.length > 0) {
                // Found matching personal information 
                for (let person of persons) {
                    // Compare the personal information found in the database with the information stored in the global variable
                    if (personGuess[action] === person.personalInfo) {
                        console.log('Matched same information:', person);
                        res.json({ success: true, data: person });
                        return;
                    }
                }
                // Found the name in the database, but no match with the information stored in the global variable
                console.log('No matching information found');
                res.json({ success: false, data: "No matching information found" });
            } else {
                // No personal information found in the database for the name matching the action value
                console.log('No information found in the database for this name');
                res.json({ success: false, data: "No information found for this name" });
            }
        })
        .catch(err => {
            console.error('Error occurred during search:', err);
            res.json({ success: false, data: { error: err } });
        });
    break;
}
});

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
