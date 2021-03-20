const Phone = require("../models/Phone");
const { encode, jwtEncode } = require("../helpers/hash");
const bcrypt = require("bcryptjs");

module.exports = {
  createPhone: async (req, res) => {
    const {
      brand,
      type,
      os,
      year,
      dispalySize,
      dispalyResolution,
      chipset,
      cpu,
      camera,
      memory,
      fingerPrint,
      nfc,
      battery,
      price,
      images,
    } = req.body.data;
    try {
      const response = await Phone.create({
        brand,
        type,
        os,
        year,
        dispalySize,
        dispalyResolution,
        chipset,
        cpu,
        camera,
        memory,
        fingerPrint,
        nfc,
        battery,
        price,
        images,
      });

      res.status(201).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getPhones: async (req, res) => {
    const { pageSize, currentPage } = req.params;
    const { search } = req.query;
    const skip =
      Number(currentPage) === 1
        ? 0
        : (Number(currentPage) - 1) * Number(pageSize);

    var findCondition = { deleteAt: null };
    if (search) {
      findCondition = {
        deleteAt: null,
        type: { $regex: new RegExp(search, "i") },
      };
    }

    try {
      const response = await Phone.find(findCondition)
        .sort([["createdAt", "DESC"]])
        .limit(Number(pageSize) * 1)
        .skip(skip);
      const count = await Phone.countDocuments(findCondition);
      res.status(200).json({
        currentPage,
        data: response,
        pageSize,
        status: true,
        totalItem: count,
        totalPage: Math.ceil(count / Number(pageSize)),
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  deletePhone: async (req, res) => {
    try {
      const { ids } = req.body;
      const response = await Phone.updateMany(
        { _id: { $in: ids } },
        { $set: { deleteAt: Date.now() } },
        { multi: true }
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  updatePhone: async (req, res) => {
    const { _id } = req.params;

    const {
      brand,
      type,
      os,
      year,
      dispalySize,
      dispalyResolution,
      chipset,
      cpu,
      camera,
      memory,
      fingerPrint,
      nfc,
      battery,
      price,
      images,
    } = req.body;
    try {
      const response = await Phone.findByIdAndUpdate(
        {
          _id,
        },
        {
          brand,
          type,
          os,
          year,
          dispalySize,
          dispalyResolution,
          chipset,
          cpu,
          camera,
          memory,
          fingerPrint,
          nfc,
          battery,
          price,
          images,
        },
        {
          returnOriginal: false,
        }
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(response);
    }
  },

  getPhoneById: async (req, res) => {
    const { _id } = req.params;
    try {
      const response = await Phone.findById({
        _id,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(response);
    }
  },
};
