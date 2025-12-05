// src/routes/api/get-by-id-ext.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const md = require('markdown-it')();
const { htmlToText } = require('html-to-text');
const sharp = require('sharp');

/**
 * Convert data between different formats
 * @param {Buffer} data - The data to convert
 * @param {string} from - Source MIME type
 * @param {string} to - Target file extension
 * @returns {Promise<Buffer>} Converted data
 */
const convertData = async (data, from, to) => {
  let converted = data;

  switch (from) {
    case 'text/markdown':
      if (to === 'html') {
        converted = Buffer.from(md.render(data.toString()));
      } else if (to === 'txt') {
        const html = md.render(data.toString());
        converted = Buffer.from(htmlToText(html, { wordwrap: 150 }));
      }
      break;

    case 'text/html':
      if (to === 'txt') {
        converted = Buffer.from(htmlToText(data.toString(), { wordwrap: 130 }));
      }
      break;

    case 'application/json':
      if (to === 'txt') {
        converted = Buffer.from(JSON.stringify(JSON.parse(data.toString()), null, 2));
      }
      break;

    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/gif':
      const image = sharp(data);
      switch (to) {
        case 'png': converted = await image.png().toBuffer(); break;
        case 'jpg':
        case 'jpeg': converted = await image.jpeg().toBuffer(); break;
        case 'webp': converted = await image.webp().toBuffer(); break;
        case 'gif': converted = await image.gif().toBuffer(); break;
      }
      break;
  }

  return converted;
};

/**
 * Get extension's respective content-type
 * @param {string} extension - File extension
 * @returns {string|null} MIME type or null if unsupported
 */
const getExtensionContentType = (extension) => {
  const types = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  return types[extension] || null;
};

/**
 * Handle fragment conversion by extension
 * GET /v1/fragments/:id.:ext
 */
module.exports = async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user;

  logger.info({ id, ext, ownerId }, `Converting fragment ${id} to .${ext}`);

  try {
    // Get the fragment
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn({ id }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Validate extension
    const targetType = getExtensionContentType(ext);
    if (!targetType) {
      logger.warn({ ext }, 'Unsupported file extension');
      return res.status(415).json(createErrorResponse(415, 'Unsupported file extension'));
    }

    // Check if conversion is supported
    if (!fragment.formats.includes(targetType)) {
      logger.warn({ 
        from: fragment.type, 
        to: targetType 
      }, 'Unsupported conversion');
      return res.status(415).json(
        createErrorResponse(415, `Cannot convert from ${fragment.type} to ${targetType}`)
      );
    }

    // Perform conversion
    const data = await fragment.getData();
    const converted = await convertData(data, fragment.type, ext);

    // Set appropriate headers
    res.setHeader('Content-Type', targetType);
    if (targetType.startsWith('text/')) {
      res.setHeader('Content-Type', `${targetType}; charset=utf-8`);
    }

    // Send response
    logger.debug(`Successfully converted fragment ${id} to ${targetType}`);
    return res.status(200).send(converted);

  } catch (err) {
    logger.error({ err, id, ext }, 'Error converting fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    return res.status(500).json(
      createErrorResponse(500, 'Error processing conversion')
    );
  }
};
