'use strict';

module.exports.imageUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};


module.exports.pdfUploadFileFilter = function (req, file, cb) {
  console.log('mimetype: ' + file.mimetype)
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only pdf files are allowed!'), false);
  }
  cb(null, true);
};
