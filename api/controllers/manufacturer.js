const Model = require('../../models');
const {Product, Manufacturer} = Model;

const manufacturerController = {
  all (req, res) {
    // Returns all manufacturers
    Manufacturer.find({})
      .exec((err, manufacturers) => res.json(manufacturers))
  },
  create (req, res) {
    const requestBody = req.body;
    // Creates a new record from a submitted form
    const newManufacturer = new Manufacturer(requestBody);
    // and saves the record to the data base
    newManufacturer.save((err, saved) => {
      // Returns the saved product after a successful save
      Manufacturer
        .findOne({_id: saved._id})
        .exec((err, Manufacturer) => res.json(Manufacturer));
    });
  },
};

module.exports = manufacturerController;
