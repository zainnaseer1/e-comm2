const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "product_seq"
  seq: { type: Number, default: 1 }, // Start from 1
});

module.exports = mongoose.model("Counter", CounterSchema);
