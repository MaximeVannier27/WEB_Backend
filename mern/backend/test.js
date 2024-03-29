// server.js

// First, import dependencies

const mongoose = require("mongoose");
const Statistique = require("./model/schema_stat");

// Set the port
const API_PORT = process.env.API_PORT || 3001;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

const updateStat = async () => {
  console.log("avant");
  try {
    let stat = await Statistique.findOne({ Nom: "Joseph Fourier" });
    console.log();
    stat.Trouvé = 80;
    await stat.save();
  } catch (error) {
    console.error("Une erreur s'est produite:", error);
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

console.log("Lancement d'une nouvelle partie");
compteur_essai = 0;

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
