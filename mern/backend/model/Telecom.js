const mongoose = require('mongoose');

const telecomSchema = new mongoose.Schema({
  Nom: String,
  sexe: String,
  animal_de_compagnie: String,
  MBTI: String,
  siècle: Number,
  nationalité: String,
  domaine: String,
  formation: String,
  récompense: String,
  funfacts : String
});

const Telecom = mongoose.model('Telecom', telecomSchema);

module.exports = Telecom;
