var express = require('express');
var router = express.Router();

const productController = require('../api/controllers/product.js');
const manufacturerController = require('../api/controllers/manufacturer.js');
const uploadController = require('../api/controllers/uploads.js');

// manufacturers
router.get('/manufacturers', manufacturerController.all);
router.post('/manufacturers', manufacturerController.create);
router.get('/manufacturers/:id', manufacturerController.byId);
router.put('/manufacturers/:id', manufacturerController.update);
router.delete('/manufacturers/:id', manufacturerController.remove);

// products
router.get('/products', productController.all);
router.get('/products/:id', productController.byId);
router.post('/products', productController.createUpdate);
router.delete('/products/:id', productController.remove);

// upload images
router.post('/uploads', uploadController.save);
module.exports = router;
