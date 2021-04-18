const Phone = require('../models/Phone');
const kmeans = require('node-kmeans');
const { encode, jwtEncode } = require('../helpers/hash');
const bcrypt = require('bcryptjs');

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
      ram,
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
        ram,
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
        type: { $regex: new RegExp(search, 'i') },
      };
    }

    try {
      const response = await Phone.find(findCondition)
        .sort([['createdAt', 'DESC']])
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
      ram,
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
          ram,
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
      res.status(500).json(error);
    }
  },

  getRecomendation: async (req, res) => {
    const { pageSize, currentPage } = req.params;
    const { search, min, max, ramMin, ramMax, memMin, memMax } = req.query;
    const isPrice = min
    const skip =
      Number(currentPage) === 1
        ? 0
        : (Number(currentPage) - 1) * Number(pageSize);
    var findCondition = { deleteAt: null };
    if (search || isPrice) {
      findCondition = {
        deleteAt: null,
        type: { $regex: new RegExp(search, 'i') },
        price:  {  $gte: Number(min) , $lte :  Number(max)},
        ram:  {  $gte: Number(ramMin) , $lte :  Number(ramMax)},
        memory:  {  $gte: Number(memMin) , $lte :  Number(memMax)}
      };
    }

    try {
      const response = await Phone.find(findCondition)
        .sort([['createdAt', 'DESC']])
        .limit(Number(pageSize) * 1)
        .skip(skip);
      const count = await Phone.countDocuments(findCondition);

      let vectors = new Array();
      for (let i = 0 ; i < response.length ; i++) {
        vectors[i] = [ response[i]['ram'] , response[i]['memory'], response[i]['camera'].rear];
      }
     
      kmeans.clusterize(vectors, {k: 3}, (err,kmeansData) => {
        if (err) console.error(err);
        else {
          const temp = []
          kmeansData.forEach((item, idx) => {
            response.forEach((dt)=> {})
            temp.push({cluster: idx+1, data: item.clusterInd})
          })
          const initialData = response
          const dataK = []
          initialData.forEach((item, idx)=>{
            temp.forEach((km)=> {
              km.data.forEach((cl)=> {
                if(cl === idx) {
                  const tl = {...item}
                  tl.cluster = km.cluster
                 
                  dataK.push(tl)
                }
              })
            })
          })
          const newData = dataK.map((itm)=>{
            var tmp = itm._doc
            tmp['cluster'] = itm.cluster;
            return tmp
          })

          res.status(200).json({
            newData,
            temp,
            kmeansData,
            currentPage,
            data: newData,
            pageSize,
            status: true,
            totalItem: count,
            totalPage: Math.ceil(count / Number(pageSize)),
          });
        }
      });

      
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
};
