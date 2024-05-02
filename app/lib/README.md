# auth.ts

### `module.exports`

This function is an exported middleware for Express applications that handles the authentication of requests based on JSON Web Tokens (JWTs).

#### Parameters

- req: Represents the HTTP request and contains information such as query strings, parameters, body, HTTP headers, etc.
- res: Represents the HTTP response that an Express app sends when it receives an HTTP request.
- next: A callback function that passes control to the next middleware function in the stack.

#### Functionality

1.  Authorization Header Check: The function first checks if the `authorization` header is present in the request (`req.headers.authorization`). If this header is missing, it sends a 401 response with the message "Authorization header missing".

2.  Token Validation:

    - If the authorization header is present, the function attempts to split the header to extract the token.
    - It then calls `authHelper.isTokenValid(token)` to verify if the token is valid. If the token is invalid, it sends a 401 response with the message "Invalid token".
    - If the token is valid, it calls the `next()` callback to pass control to the next middleware function, allowing the request to proceed.

3.  Error Handling: If any error occurs during the token validation process (e.g., an exception is thrown), the error is logged using `(global as any).log.error(error)`, and a 401 response with the message "Invalid token" is sent.

This middleware ensures that only requests with valid authorization tokens can proceed further in the processing pipeline, providing a basic security layer for routes that require authentication.

# logger.ts

### File Content

typescript

Copy code

`var bunyan = require('bunyan');
module.exports = bunyan.createLogger({"name": "FIBER Engine","level": 10});`

### Function Explanation

- Bunyan Import: The file starts by importing the `bunyan` library, which is a simple and fast JSON logging library for node.js services.

- Logger Creation:

  - `bunyan.createLogger(...)`: This function call creates a new Bunyan logger. The `createLogger` function takes an object as an argument, which specifies the configuration for the logger.
  - `name`: "FIBER Engine" - This is the name assigned to the logger instance. It helps identify logs that are part of the "FIBER Engine" context.
  - `level`: 10 - This defines the log level of the logger. In Bunyan, the level `10` corresponds to "TRACE", the most verbose logging level, which is used for detailed debugging information.

This configuration sets up the logger to capture detailed tracing information under the identifier "FIBER Engine", useful for debugging and development purposes.
