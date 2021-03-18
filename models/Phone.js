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
    tahun: {
      type: Number,
    },
    dispalySize: {
      type: String,
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
      type: Boolean,
    },
    nfc: {
      type: Boolean,
    },
    battery: {
      type: String,
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
