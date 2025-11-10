const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storageDocs = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    return {
      folder: 'SDN392/docs',
      resource_type: 'raw',             
      format: ext,                   
      public_id: `file-${Date.now()}-${file.originalname}`
    };
  }
});

const uploadDocs = multer({ storage: storageDocs });

module.exports = uploadDocs;
