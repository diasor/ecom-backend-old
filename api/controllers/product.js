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
  createUpdate (req, res) {
    // Creates a new record from a submitted form
    let form = new IncomingForm();
    let newFileName = '';
    let idParam = '';
    // managing the file (if there is one)
    form.on('fileBegin', (name, file) => {
      newFileName = file.name;
      file.path = path.join(getImagePath(), newFileName);
    });
    form.parse(req, (err, fields, files) => {
      idParam = fields.id;
      let isNewProduct = isEmpty(idParam);
      let oldImageName = '';
      let product = new Product();
      // creating the new product to be saved in the database
      if (!isNewProduct) {
        product._id = idParam;
      }
      product.name = fields.name;
      product.price = fields.price;
      product.description = fields.description;
      product.imageName = newFileName;
      product.manufacturer = fields.manufacturer;

      if (isNewProduct) {
        // if it is a new product, we just save it
        product.save((err, saved) => res.json(saved));
      } else {
        // if the object already existed, the it must be found in the database to be updated
        Product.findById({_id: idParam}, (err, productDocument) => {
          // updates the product payload
          productDocument.name = product.name;
          productDocument.description = product.description;
          productDocument.price = product.price;
          productDocument.manufacturer = product.manufacturer;
          if (!isEmpty(newFileName)) {
            // checking whether a new image must be uploaded
            newFileName = product.imageName;
            oldImageName = productDocument.imageName;
            productDocument.imageName = product.imageName;
          }

          if (!isEmpty(newFileName)) {
            const uploadDir = getImagePath();
            const oldImagePath = `${uploadDir}${oldImageName}`;
            deleteImage(oldImagePath);
          }
          // saves the product
          productDocument.save((err, saved) => res.json(saved));
        });
      }
    });
    form.on('error', (err) => {
      console.log('error ', JSON.stringify(err));
    });
  },
  remove (req, res) {
    const idParam = req.params.id;
    // Removes a product
    Product.findById({_id: idParam}, (err, productDocument) => {
      if (err) {
        console.log('ERROR ', err);
      } else {
        // checking whether a new image must be uploaded
        const uploadDir = getImagePath();
        const removeImageName = `${uploadDir}${productDocument.imageName}`;
        if (!isEmpty(productDocument.imageName)) {
          deleteImage(removeImageName);
        }
      }
    })
    .then(() => Product.deleteOne({_id: idParam}, (err) => res.json("OK")))
    .catch(err => console.log('error neuvo ', err));
  },
};
module.exports = productController;

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
    try {
      productItem.image =  fs.readFileSync(fileName).toString('base64');
    } catch (err)  {
      productItem.image =  '';
      console.log('Error reading an image ', err);
    }

  }
  return productItem;
}

function deleteImage (imageName) {
  fs.unlink(imageName, (err) => {
    if(err && err.code == 'ENOENT') {
      // file doens't exist
      console.log("File doesn't exist, won't remove it.");
    } else if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.log("Error occurred while trying to remove file");
    } else {
      console.log(`removed`);
    }
  });
}

function getImagePath () {
  const imagePath = process.cwd();
  return `${imagePath}/public/images/productImages/`;
}
