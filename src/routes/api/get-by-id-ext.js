const { Fragment } = require('../../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const sharp = require('sharp');

module.exports = async (req, res) => {
  try {
    const { id, ext } = req.params;
    const ownerId = req.user;

    // Get the fragment
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn({ id }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Get the fragment data
    const data = await fragment.getData();

    // Handle different content types
    let converted;
    const targetType = getExtensionContentType(ext);

    switch (fragment.type) {
      case 'text/plain':
      case 'text/markdown':
      case 'text/html':
      case 'application/json':
        // No conversion needed for text-based formats
        break;
      case 'image/png':
      case 'image/jpeg':
      case 'image/webp':
      case 'image/gif': {
        const image = sharp(data);
        switch (ext) {
          case 'png':
            converted = await image.png().toBuffer();
            break;
          case 'jpg':
          case 'jpeg':
            converted = await image.jpeg().toBuffer();
            break;
          case 'webp':
            converted = await image.webp().toBuffer();
            break;
          case 'gif':
            converted = await image.gif().toBuffer();
            break;
        }
        break;
      }
    }

    if (!converted) {
      converted = data;
    }

    // Set response headers
    res.setHeader('Content-Type', targetType);
    res.setHeader('Content-Length', Buffer.byteLength(converted));

    // Send the converted data
    return res.status(200).send(converted);
  } catch (err) {
    logger.error({ err, id: req.params.id }, 'Error converting fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    return res.status(500).json(createErrorResponse(500, 'Error processing conversion'));
  }
};

function getExtensionContentType(extension) {
  const types = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return types[extension] || 'application/octet-stream';
}
