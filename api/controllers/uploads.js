const IncomingForm = require('formidable');

const uploadController = {
  save (req, res) {
    // Returns all manufacturers
    const form = new IncomingForm();
    form.on('file', (field, file) => {
      // Do something with the file
      // e.g. save it to the database
      // you can access it using file.path
      console.log('filename ', file.name);
    });
    form.on('end', () => {
      res.json();
    });
    form.parse(req);
  },
};

module.exports = uploadController;
