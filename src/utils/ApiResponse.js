// Define a class for structuring standard API responses
class ApiResponse {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;   // HTTP status code for the response (e.g., 200, 404)
    this.data = data;               // Response data (e.g., the result of a successful operation)
    this.message = message;         // Message describing the response (default is "success")
    this.success = statusCode < 400; // Boolean flag; true if status code indicates success (less than 400)
  }
}

// This class allows consistent structure in API responses across the application, making it easier to interpret results.
export {ApiResponse}