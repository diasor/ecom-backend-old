const mongoose = require('mongoose');
const Schema = mongoose.Schema,
  model = mongoose.model.bind(mongoose),
  ObjectId = mongoose.Schema.Types.ObjectId;

const productSchema = Schema({
  id: ObjectId,
  name: String,
  price: Number,
  description: String,
  imageName: String,
  // One to many relationship
  manufacturer: {type: ObjectId, ref: 'Manufacturer'}
});

const manufacturerSchema = Schema({
  id: ObjectId,
  name: String,
});

const Product = model('Product', productSchema);
const Manufacturer = model('Manufacturer', manufacturerSchema);

module.exports = {Product, Manufacturer};
