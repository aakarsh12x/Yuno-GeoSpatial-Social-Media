const Joi = require('joi');

/**
 * Validation schemas for different endpoints
 */
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(6).max(128).required()
      .messages({
        'string.min': 'Password must be at least 6 characters long'
      }),
    age: Joi.number().integer().min(13).max(120).optional(),
    city: Joi.string().max(100).optional(),
    school: Joi.string().max(200).optional(),
    college: Joi.string().max(200).optional(),
    workplace: Joi.string().max(200).optional(),
    interests: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    age: Joi.number().integer().min(13).max(120).optional(),
    city: Joi.string().max(100).optional(),
    school: Joi.string().max(200).optional(),
    college: Joi.string().max(200).optional(),
    workplace: Joi.string().max(200).optional(),
    interests: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
  }).min(1), // At least one field required

  discover: Joi.object({
    radius: Joi.number().min(0.1).max(100).default(10),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0)
  }),

  sendSpark: Joi.object({
    receiverId: Joi.number().integer().positive().required(),
    message: Joi.string().max(500).optional()
  })
};

/**
 * Create validation middleware for a specific schema
 * @param {string} schemaName - Name of the schema to validate against
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @returns {function} - Express middleware function
 */
const validateRequest = (schemaName, source = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Replace the original data with validated and sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Custom validation for coordinate pairs
 */
const validateCoordinates = (req, res, next) => {
  const { latitude, longitude } = req.body;
  
  // If one coordinate is provided, both must be provided
  if ((latitude !== undefined && longitude === undefined) || 
      (longitude !== undefined && latitude === undefined)) {
    return res.status(400).json({
      success: false,
      message: 'Both latitude and longitude must be provided together'
    });
  }
  
  next();
};

module.exports = {
  validateRequest,
  validateCoordinates,
  schemas
};
