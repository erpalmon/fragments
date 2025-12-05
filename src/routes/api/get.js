// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const md = require('markdown-it')();
const { htmlToText } = require('html-to-text');
const sharp = require('sharp');

// Get extension's respective content-type
const getExtensionContentType = (extension) => {
  switch (extension) {
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
};

// Convert data between formats
const convertData = async (data, from, to) => {
  let convertedData = data;

  switch (from) {
    case 'text/markdown':
      if (to === 'txt' || to === 'html') {
        convertedData = md.render(data.toString());
        if (to === 'txt') {
          convertedData = htmlToText(convertedData, { wordwrap: 150 });
        }
      }
      break;

    case 'text/html':
      if (to === 'txt') {
        convertedData = htmlToText(data.toString(), { wordwrap: 130 });
      }
      break;

    case 'application/json':
      if (to === 'txt') {
        convertedData = JSON.stringify(JSON.parse(data.toString()), null, 2);
      }
      break;

    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/gif':
      const image = sharp(data);
      switch (to) {
        case 'png':
          convertedData = await image.png().toBuffer();
          break;
        case 'jpg':
        case 'jpeg':
          convertedData = await image.jpeg().toBuffer();
          break;
        case 'webp':
          convertedData = await image.webp().toBuffer();
          break;
        case 'gif':
          convertedData = await image.gif().toBuffer();
          break;
      }
      break;
  }

  logger.debug(`Converted from ${from} to ${to}`);
  return convertedData;
};

// List all fragments for the current user
module.exports.listUserFragments = async (req, res, next) => {
  const ownerId = req.user;
  const expand = req.query.expand == 1;

  logger.info({ ownerId, expand }, `GET /fragments`);

  try {
    const fragments = await Fragment.byUser(ownerId, expand);
    logger.debug({ fragments }, 'User fragments retrieved');
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.warn({ err }, "Failed to retrieve user's fragments");
    next(err);
  }
};

// Get fragment data by ID with optional conversion
module.exports.getFragmentDataById = async (req, res) => {
  const ownerId = req.user;
  const [id, extension] = req.params.id.split('.');

  logger.info({ id, ownerId, extension }, `GET /fragments/${req.params.id}`);

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const data = await fragment.getData();

    if (extension) {
      const extensionType = getExtensionContentType(extension);
      if (!extensionType) {
        throw new Error('Unsupported file extension');
      }

      if (!fragment.formats.includes(extensionType)) {
        throw new Error(`Cannot convert from ${fragment.mimeType} to ${extensionType}`);
      }

      const convertedData = await convertData(data, fragment.mimeType, extension);
      res.setHeader('Content-Type', extensionType);
      return res.status(200).send(convertedData);
    }

    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'Error getting fragment data');
    const status = err.message.includes('not found') ? 404 : 415;
    res.status(status).json(createErrorResponse(status, err.message));
  }
};

// Get fragment metadata by ID
module.exports.getFragmentInfoById = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  logger.info({ id, ownerId }, `GET /fragments/${id}/info`);

  try {
    const fragment = await Fragment.byId(ownerId, id);
    logger.debug({ fragment }, 'Fragment metadata retrieved');
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.warn({ err }, 'Fragment not found');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
