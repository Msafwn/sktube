/**
 * Standardized API Response class
 * Frontend ko uniform JSON response structure bhejne ke liye
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        // Agar status code 400 se kam hai to success true hoga
        this.success = statusCode < 400;
    }
}

export { ApiResponse };