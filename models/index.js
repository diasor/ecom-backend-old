const mongoose = require('mongoose');
const Schema = mongoose.Schema,
  model = mongoose.model.bind(mongoose),
  ObjectId = mongoose.Schema.Types.ObjectId,
  Types = mongoose.Types;

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

const cartSchema = Schema({
  id: ObjectId,
  expire: Date,
  items: [
    {
      product_id: String,
      amount: Number,
    }
  ]
});

const Product = model('Product', productSchema);
const Manufacturer = model('Manufacturer', manufacturerSchema);
const Cart = model('Cart', cartSchema);

module.exports = {Product, Manufacturer, Cart, Types};
