//model/schema_personnage.js
const { Int32 } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const PersonnageSchema = new Schema({
  Nom: String,
  Sexe: String,
  Animal: String,
  MBTI: String,
  Siecle: String,
  Nationalite: String,
  Domaine: String,
  Formation: String,
  Recompense: String,
  Image: String,
  Funfact: String,
}, { timestamps: true });

// export our module to use in server.js
module.exports = mongoose.model('Personnage', PersonnageSchema);