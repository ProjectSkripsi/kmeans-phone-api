const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const phoneSchema = new Schema(
  {
    brand: {
      type: String,
    },
    type: {
      type: String,
    },
    os: {
      type: String,
    },
    year: {
      type: Number,
    },
    dispalySize: {
      type: Number,
    },
    dispalyResolution: {
      type: String,
    },
    chipset: {
      type: String,
    },
    cpu: {
      type: String,
    },
    camera: {
      front: Number,
      rear: Number,
    },
    memory: {
      type: String,
    },
    fingerPrint: {
      type: String,
    },
    nfc: {
      type: String,
    },
    battery: {
      type: String,
    },
    price: {
      type: Number,
    },
    images: [
      {
        imageUrl: String,
      },
    ],
    deleteAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Phone = mongoose.model("Phone", phoneSchema);
module.exports = Phone;
