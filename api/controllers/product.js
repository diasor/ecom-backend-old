const fs = require('fs');
const path = require('path');
// const util = require('util');
const IncomingForm = require('formidable');
const { isEmpty, each } = require('lodash');
const Model = require('../../models');
const { Product, Manufacturer } = Model;

const productController = {
  all (req, res) {
    // Returns all products
    Product.find({})
      // manufacturer information
      .populate('manufacturer')
      .exec((err, products) => {
        productsResults = [];
        each(products, (item) => {
          productItem = buildProduct(item);
          productsResults.push(productItem);
        });
        res.json(productsResults);
      })
  },
  byId (req, res) {
    const idParam = req.params.id;
    // Returns a single product based on the passed in ID parameter
    Product
      .findOne({_id: idParam})
      // as well as it's manufacturer
      .populate('manufacturer')
      .exec((err, product) => res.json(product));
  },
  create (req, res) {
    // Creates a new record from a submitted form
    let form = new IncomingForm();
    let newFileName = '';
    form.on('fileBegin', (name, file) => {
      const currentPath = process.cwd();
      const uploadDir = `${currentPath}/public/images/productImages/`;
      const [fileName, fileExt] = file.name.split('.');
      newFileName = `${fileName}_${new Date().getTime()}.${fileExt}`;
      file.path = path.join(uploadDir, newFileName);
    });
    form.parse(req, (err, fields, files) => {
      let newProduct = new Product({
        name: fields.name,
        price: fields.price,
        description: fields.description,
        imageName: newFileName,
        manufacturer: fields.manufacturer,
      });
      newProduct.save((err, saved) => {
        // Returns the saved product after a successful save
        Product
          .findOne({_id: saved._id})
          .populate('manufacturer')
          .exec((err, product) => res.json(product));
      });
    });
    form.on('error', (err) => {
      console.log('error ', JSON.stringify(err));
    });
  },
  update (req, res) {
    console.log('UPDATE product ');
    const idParam = req.params.id;
    console.log('id ', idParam);
    let product = req.body;
    let form = new IncomingForm();
    let newFileName = '';
    let updateProduct = new Product();
    form.on('fileBegin', function (name, file) {
      console.log('*****************fileBegin  ');
      const currentPath = process.cwd();
      const uploadDir = `${currentPath}/public/images/productImages/`;
      const [fileName, fileExt] = file.name.split('.');
      newFileName = `${fileName}_${new Date().getTime()}.${fileExt}`;
      file.path = path.join(uploadDir, newFileName);
      console.log('*********END fileBegin');
    });
    form.parse(req, (err, fields, files) => {
      console.log('*********PARSE ', fields.name);
      updateProduct.name = fields.name;
      updateProduct.price = fields.price;
      updateProduct.description = fields.description;
      updateProduct.imageName = fields.fileName;
      updateProduct.manufacturer = fields.manufacturer;
      console.log('*******END PARSE');
    }).then(() => {
      // Finds a product to be updated
      Product.findById({_id: idParam}, (err, productDocument) => {
        // Updates the product payload
        productDocument.name = updateProduct.name;
        productDocument.description = updateProduct.description;
        console.log('new desc', updateProduct.description);
        productDocument.price = updateProduct.price;
        console.log('new price ', updateProduct.price);
        productDocument.manufacturer = updateProduct.manufacturer;
        if (productDocument.imageName !== updateProduct.imageName) {
          // checking whether a new image must be uploaded
          newFileName = updateProduct.imageName;
          productDocument.imageName = updateProduct.imageName;
          console.log('new image ', updateProduct.imageName);
        }
        // Saves the product
        productDocument.save(() => res.json(updated));
      });
    })
    .catch(err => console.log('ERROR update ', err));
  },
  remove (req, res) {
    const idParam = req.params.id;
    // Removes a product
    Product.findOne({_id: idParam}).remove( (err, removed) => res.json(idParam));
  }
};

function buildProduct (itemResult) {
  const currentPath = process.cwd();
  const uploadDir = `${currentPath}/public/images/productImages/`;
  productItem = {
    _id: itemResult._id,
    name: itemResult.name,
    price: itemResult.price,
    description: itemResult.description,
    imageName: itemResult.imageName,
    manufacturer: {
      id: itemResult.manufacturer._id,
      name: itemResult.manufacturer.name,
    },
    image: '',
  };
  if (!isEmpty(itemResult.imageName)) {
    let fileName = `${uploadDir}${itemResult.imageName}`;
    productItem.image =  fs.readFileSync(fileName).toString('base64');
  }
  return productItem;
};

module.exports = productController;
