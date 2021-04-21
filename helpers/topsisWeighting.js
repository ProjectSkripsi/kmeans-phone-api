const weightRam = (val) => {
  var temp = 0;
  if (val < 4) {
    temp = 20;
  } else if (val <= 8) {
    temp = 50;
  } else if (val > 8) {
    temp = 100;
  } else {
    temp = 0;
  }
  return temp;
};

const weightMemory = (val) => {
  var temp = 0;
  if (val >= 128)  {
    temp = 100;
  } else if (val >= 64) {
    temp = 50;
  } else if (val < 64){
    temp = 20;
  } else {
    temp = 0;
  }
  return temp;
};

const weightPrimaryCam = (val) => {
  var temp = 0;
  if (val >= 100) {
    temp = 100;
  } else if (val >= 64) {
    temp = 50;
  } else if (val < 32) {
    temp = 20;
  } else {
    temp = 0;
  }
  return temp;
};


const weightSecondaryCam = (val) => {
  var temp = 0;
  if (val >= 16)  {
    temp = 100;
  } else if (val >= 8) {
    temp = 50;
  } else if (val < 8){
    temp = 20;
  } else {
    temp = 0;
  }
  return temp;
};

const weightBattery = (val) => {
  var temp = 0;
  if  (val >= 3000) {
    temp = 100;
  } else if (val >= 1000) {
    temp = 50;
  } else if (val < 1000) {
    temp = 20;
  } else {
    temp = 0;
  }
  return temp;
};

module.exports = {
  weightRam,
  weightMemory,
  weightPrimaryCam,
  weightSecondaryCam,
  weightBattery
};