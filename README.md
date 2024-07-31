# User CRUD service

This project is a CRUD service for managing users, built with AWS Lambda, API Gateway, and DynamoDB, using the Serverless framework. It includes endpoints to create, read, update, and delete users, with Unit tests, and integration tests using Postman.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- Node.js (version 20.x)
- npm (Node Package Manager) (version 10.8.1)
- Serverless Framework (version 4.1.18)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/juacarvalhoaws/user-service.git
   cd user-service

2. Install the dependencies

   ```sh
   npm install

3. Run Unit Tests

   ```sh
   npm test

4. Deploy service 

   ```sh
   serverless deploy
  
# Testing the RESTFul APIs
## Using Postman

1. Import the Postman collection:
  . Open Postman
  . Click on `Import` in the top left corner.
  . Select `Import File`.
  . Choose the `tests/user-api-tests.postman_collection.json` file from the repository.

2. Run the requests in the collection
  . You can now run the requests in the `User API Tests` collection to test the endpoints.

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow to run the tests automatically on push or pull request to the main branch. The workflow is defined in `.github/workflows/main.yml`.

The workflow performs the Unit tests, integration tests,  and also deploys the service via CloudFormation.

## Project Structure

- **handler.js**: Contains the Lambda functions for the CRUD operations.
- **serverless.yml**: Serverless framework configuration file.
- **tests/**: Directory containing the Postman collection for integration tests and Unit tests.
- **.github/workflows/**: Directory containing GitHub Actions workflows.

## Endpoints

 - **POST - https://qwzj7d4ouk.execute-api.us-east-1.amazonaws.com/dev/users**: Create a new User.
  
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**Note:** All fields are required fields. Email must be unique.

  ```json
  {
    "name": "John",
    "lastname": "Doe",
    "email": "john.doe@example2.com",
    "dob": "1990-01-01"
  }
  ```

 - **GET - https://qwzj7d4ouk.execute-api.us-east-1.amazonaws.com/dev/users**: Retrieve all user with pagination.
 - **GET - https://qwzj7d4ouk.execute-api.us-east-1.amazonaws.com/dev/users/{UserID}**: Retrieve details of a specific user.
 - **PUT - https://qwzj7d4ouk.execute-api.us-east-1.amazonaws.com/dev/users/{UserID}**: Update details of a specific user.
 - **DELETE - https://qwzj7d4ouk.execute-api.us-east-1.amazonaws.com/dev/users/{UserID}**:  Delete a specific user.


## Error Handling

The service implements thorough error handling to return descriptive error messages and suitable HTTP status codes for various types of errors.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.
