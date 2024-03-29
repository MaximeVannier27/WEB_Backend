//model/collect.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const CollectSchema = new Schema({
  Nom: String,
  Sexe: String,
  Animal: String,
  MBTI : String,
  Siecle : Int16Array,
  Nationalite : String,
  Domaine : String,
  Formation : String,
  Recompense : String,
  Anecdote : String

}, { timestamps: true });

// export our module to use in server.js
module.exports = mongoose.model('Collect', CollectSchema);