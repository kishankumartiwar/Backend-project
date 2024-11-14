// Middleware to handle asynchronous route handlers and catch errors
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // Execute the request handler and catch any errors, passing them to next middleware
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// Export the asyncHandler function for use with route handlers
export { asyncHandler };
