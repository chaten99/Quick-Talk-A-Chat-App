const responseHelper = {
  success: (res, message, data = null, statusCode = 200) => {
    const response = {
      success: true,
      message
    };

    if (data) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  error: (res, message, statusCode = 500, details = null) => {
    const response = {
      success: false,
      message
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  },

  validationError: (res, error) => {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: Object.values(error.errors).map(err => err.message)
    });
  },

  castError: (res, message = 'Invalid ID provided') => {
    return res.status(400).json({
      success: false,
      message
    });
  },

  notFound: (res, resource = 'Resource') => {
    return res.status(404).json({
      success: false,
      message: `${resource} not found`
    });
  },

  unauthorized: (res, message = 'Unauthorized access') => {
    return res.status(401).json({
      success: false,
      message
    });
  },

  forbidden: (res, message = 'Access denied') => {
    return res.status(403).json({
      success: false,
      message
    });
  }
};

export default responseHelper;