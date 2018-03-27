'use strict';

module.exports.imageUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif' && file.mimetype !== 'image/bmp') {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true)
}


module.exports.docUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'application/pdf' && file.mimetype !== 'text/plain' && file.mimetype !== 'application/msword' && file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {    
    return cb(new Error('Only document files are allowed!'), false);
  }
  cb(null, true)
};
