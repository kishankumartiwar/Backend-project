// Define a custom error class for handling API errors
class ApiError extends Error {
  constructor(
    statusCode,                   // HTTP status code representing the error (e.g., 404, 500)
    message = "Something went wrong", // Default error message if not provided
    errors = [],                   // Array to hold additional error details if any
    stack = ""                     // Optional stack trace, useful for debugging
  ) {
    super(message);               // Call the parent Error class with the message
    this.statusCode = statusCode;  // Assign the status code to the instance
    this.data = null;              // Placeholder for any data, can be used in extended classes
    this.message = message;        // Set the error message
    this.success = false;          // Flag indicating the operation was not successful
    this.errors = errors;          // Attach any additional error details

    // Set the stack trace if provided, else capture the stack trace from the current constructor
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the ApiError class to use in other parts of the application
export { ApiError };
