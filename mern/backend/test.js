// server.js

// first we import our dependencies…
const mongoose = require("mongoose");

// set our port to either a predetermined port number if you have set it up, or 3001

mongoose.connect("mongodb://localhost:3010/");
var db = mongoose.connection;
db.on('error', () => console.error('Erreur de connexion'));


db.Statistiques.update(
{"Nom": "Joseph Fourier"},
{$inc: {"Tirages": 1}}
);

