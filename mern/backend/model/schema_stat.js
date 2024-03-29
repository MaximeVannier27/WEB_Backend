//model/schema_stat.js
const { Int32 } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create new instance of the mongoose.schema. the schema takes an
// object that shows the shape of your database entries.
const StatistiquesSchema = new Schema({
  Nom: String,
  Tirages: Number,
  Trouvé : Number
}, { timestamps: true });

// export our module to use in server.js
module.exports = mongoose.model('Statistique', StatistiquesSchema);