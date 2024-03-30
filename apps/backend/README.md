# Examina Backend API

This is the backend API for the Examina application. It is built using Express.js and MongoDB.

## You can check the diagram for the API flow from here :
https://drive.google.com/file/d/1PI3lqNI9EkaBnj8c4wtQMHXOVWOwuigK/view?usp=sharing

## Prerequisites

Before running the API, make sure you have the following installed:

- Node.js
- MongoDB

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/Esayf/Examina-Backend-API.git
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Configure the MongoDB connection:

    Open the `config/config.env` file and update the MongoDB connection URL with your own credentials.

4. Start the server as dev:

    ```bash
    npm run dev
    ```

    The API will be available at `http://localhost:5000`.

## API Endpoints
 GET /register route renders the register view.
 POST /register_with_email route creates a new user with an email and password.
 GET /session/get-message-to-sign/:walletAddress route generates a message to sign with a wallet address.
 POST / route verifies the signature and creates a new user if the signature is valid.
 GET /session/ route returns the user's session.


## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
