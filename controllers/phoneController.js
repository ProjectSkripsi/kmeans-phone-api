const Phone = require('../models/Phone');
const kmeans = require('node-kmeans');
const {  
  weightRam,
  weightMemory,
  weightPrimaryCam,
  weightSecondaryCam,
  weightBattery
} = require('../helpers/topsisWeighting')
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
    const  next = Number(pageSize) * Number(currentPage)

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
    if (Number(currentPage) === 0) {
      res.status(200).json({
        currentPage,
        data: [],
        pageSize,
        status: true,
        totalItem: 0,
        totalPage: 0,
      });
    } else {
    try {
      const response = await Phone.find(findCondition)
        .sort([['createdAt', 'DESC']])
      const count = await Phone.countDocuments(findCondition);

      let vectors = new Array();
      for (let i = 0 ; i < response.length ; i++) {
        vectors[i] = [ response[i]['ram'] , response[i]['memory'], response[i]['camera'].rear];
      }
    
      kmeans.clusterize(vectors, {k: 3}, (err,kmeansData) => {
        if (err) console.error(`==>>`,err);
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
          let tempWeight = newData;
          tempWeight.forEach(function (item) {
            item.v1 = weightRam(item.ram);
            item.v2 = weightMemory(item.memory);
            item.v3 = weightPrimaryCam(item.camera.rear);
            item.v4 = weightSecondaryCam(item.camera.front);
            item.v5 = weightBattery(item.battery);
          });

          let a = [];
          tempWeight.forEach((item, i) => {
            a[i] = [
              item.v1,
              item.v2,
              item.v3,
              item.v4,
              item.v5,
              item.type,
              item.brand,
              item._id,
            ];
          });

          let tV1 = 0;
          let tV2 = 0;
          let tV3 = 0;
          let tV4 = 0;
          let tV5 = 0;

          a.forEach((item, index) => {
            tV1 = tV1 + Math.pow(item[0], 2);
            tV2 = tV2 + Math.pow(item[1], 2);
            tV3 = tV3 + Math.pow(item[2], 2);
            tV4 = tV4 + Math.pow(item[3], 2);
            tV5 = tV5 + Math.pow(item[4], 2);
          });

          const totalV1 = Number(Math.sqrt(tV1).toFixed(2));
          const totalV2 = Number(Math.sqrt(tV2).toFixed(2));
          const totalV3 = Number(Math.sqrt(tV3).toFixed(2));
          const totalV4 = Number(Math.sqrt(tV4).toFixed(2));
          const totalV5 = Number(Math.sqrt(tV5).toFixed(2));

          let b = [];
          let minMax = {
            0: {
              min: 0,
              max: 0,
            },
            1: {
              min: 0,
              max: 0,
            },
            2: {
              min: 0,
              max: 0,
            },
            3: {
              min: 0,
              max: 0,
            },
            4: {
              min: 0,
              max: 0,
            },
          };
          a.forEach((item, i) => {
            let c = [];

            item.forEach((a, index) => {
              if (index === 0) {
                const idx1 = (Number(a) / totalV1).toFixed(2);
                c.push(idx1);
                const val1 = Number(idx1);
                if (val1 > minMax[index].max) {
                  minMax[index].max = val1;
                }
                if (minMax[index].min === 0) {
                  minMax[index].min = val1;
                }
                if (val1 < minMax[index].min) {
                  minMax[index].min = val1;
                }
              } else if (index === 1) {
                const idx2 = (Number(a) / totalV2).toFixed(2);
                c.push(idx2);
                const val2 = Number(idx2);
                if (val2 > minMax[index].max) {
                  minMax[index].max = val2;
                }
                if (minMax[index].min === 0) {
                  minMax[index].min = val2;
                }
                if (val2 < minMax[index].min) {
                  minMax[index].min = val2;
                }
              } else if (index === 2) {
                const idx3 = (Number(a) / totalV3).toFixed(2);
                c.push(idx3);
                const val3 = Number(idx3);
                if (val3 > minMax[index].max) {
                  minMax[index].max = val3;
                }
                if (minMax[index].min === 0) {
                  minMax[index].min = val3;
                }
                if (val3 < minMax[index].min) {
                  minMax[index].min = val3;
                }
              } else if (index === 3) {
                const idx4 = (Number(a) / totalV4).toFixed(2);
                c.push(idx4);
                const val4 = Number(idx4);
                if (val4 > minMax[index].max) {
                  minMax[index].max = val4;
                }
                if (minMax[index].min === 0) {
                  minMax[index].min = val4;
                }
                if (val4 < minMax[index].min) {
                  minMax[index].min = val4;
                }
              } else if (index === 4) {
                const idx5 = (Number(a) / totalV5).toFixed(2);
                c.push(idx5);
                const val5 = Number(idx5);
                if (val5 > minMax[index].max) {
                  minMax[index].max = val5;
                }
                if (minMax[index].min === 0) {
                  minMax[index].min = val5;
                }
                if (val5 < minMax[index].min) {
                  minMax[index].min = val5;
                }
              }
            });
            b[i] = c;
          });

          let dPlus = [];
          let dMin = [];
          const reducer = (accumulator, currentValue) =>
            accumulator + currentValue;
          b.forEach((c, idx) => {
            const temp = [];
            const tempMin = [];
            c.forEach((item, i) => {
              let dTambah = Number(item) - minMax[i].max;
              let dKurang = Number(item) - minMax[i].min;
              let dTambahTemp = Math.pow(dTambah, 2).toFixed(2);
              let dKurangTemp = Math.pow(dKurang, 2).toFixed(2);
              temp.push(Number(dTambahTemp));
              tempMin.push(Number(dKurangTemp));
            });

            dPlus[idx] = Math.sqrt(temp.reduce(reducer)).toFixed(2);
            dMin[idx] = Math.sqrt(tempMin.reduce(reducer)).toFixed(2);
          });

          let topsis = [];
          dPlus.forEach((item, idx) => {
            let total = Number(item) / (Number(item) + Number(dMin[idx])) || 0;
            let newTot = total.toFixed(2);
            topsis.push({
              "D+": item,
              "D-": dMin[idx],
              topsis: total.toFixed(2),
            });
          });

          let newDataTop = newData;
          let newTemp = [];
          for (let i = 0; i < newData.length; i++) {
            newTemp.push({
              _id: newDataTop[i]._id,
              brand: newDataTop[i].brand,
              type: newDataTop[i].type,
              os: newDataTop[i].os,
              year: newDataTop[i].year,
              dispalySize: newDataTop[i].dispalySize,
              dispalyResolution: newDataTop[i].dispalyResolution,
              chipset: newDataTop[i].chipset,
              cpu: newDataTop[i].cpu,
              camera: newDataTop[i].camera,
              memory: newDataTop[i].memory,
              ram: newDataTop[i].ram,
              fingerPrint: newDataTop[i].fingerPrint,
              nfc: newDataTop[i].nfc,
              battery: newDataTop[i].battery,
              price: newDataTop[i].price,
              images: newDataTop[i].images,
              cluster: newDataTop[i].cluster,
              topsis: topsis[i],
            });
          }
          newTemp.sort((a, b) => (a.topsis.topsis < b.topsis.topsis ? 1 : -1));
          res.status(200).json({
            valueDivisor: a,
            extractValue: b,
            minMaxVal: minMax,
            valTotalDivisor: [totalV1, totalV2, totalV3, totalV4, totalV5],
            kmeansData,
            currentPage,
            data: newTemp.slice(Number(skip), next),
            pageSize,
            status: true,
            totalItem: count,
            totalPage: Math.ceil(count / Number(pageSize)),
          });
        }
      });

      
    } catch (error) {
      
      res.status(500).json(error);
    }
  }
  },
};
