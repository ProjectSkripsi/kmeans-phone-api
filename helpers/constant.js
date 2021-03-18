const learningConcept = (type) => {
  var temp = 0;
  if (type === "Tekstual") {
    temp = 50;
  } else {
    temp = 100;
  }
  return temp;
};

const convert = (type) => {
  var temp = 0;
  if (type === "Kurang") {
    temp = 50;
  } else if (type === "Cukup") {
    temp = 100;
  } else {
    temp = 0;
  }
  return temp;
};

module.exports = {
  learningConcept,
  convert,
};
