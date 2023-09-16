# LineBot - School Management System with LINE Messaging Integration
The LineBot is a student's personal project that functions as a teacher-student interaction and score/course management autoreply bot. It allows for seamless communication and management within a school environment using the LINE messaging app.

### Getting Started
To set up and run the LineBot on your local environment, follow these instructions:

### Prerequisites
Node.js and npm: Ensure you have Node.js and npm (Node Package Manager) installed on your system. You can download and install them from the official website: Node.js.

MySQL Database: You will need MySQL as your database server. You can install it locally or use a remote MySQL database.

### Installation
Initialize Node.js Project: In your project directory, initialize a Node.js project and create a package.json file by running the following command:

```shell
npm init -y
```
Install Dependencies: Install the necessary npm packages by running:

```shell
npm install dotenv @line/bot-sdk express mysql2
```
Configure Environment Variables: Create a .env file in your project directory and provide the required credentials. Replace the placeholders with your actual values. Example:

```dotenv
# Line official cridential
export CHANNEL_SECRET=
export CHANNEL_ACCESS_TOKEN=

# Port on the local
export PORT=3000

# To connect the local mysql db
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=bot

# NGROK to expose localhost for img can be preview in the img funciton
NGROK_LINK=

# This password is use to enter local admin web page
PASSWORD=
```
Database Setup: Create a MySQL database named "bot" and import the required schema by running the code provided in the .sql file.

Expose Your Local Server: To test the bot with LINE, you can use Ngrok to expose your local server to the internet.

Usage
With the LineBot set up, you have your own school management system that interacts via LINE. While the local web UI may be incomplete, it serves as a foundation for building out additional features and functionality.

### Contributing
Contributions are welcome! Feel free to open issues or pull requests to improve this project.

### License
Currently not sure what it does.

### Acknowledgments
Special thanks to the [LINE messaging platform](https://developers.line.biz/en/services/messaging-api/ "Line message api documentation") for providing tools and APIs for bot development.

### Author
Sam
Contact
If you have any questions or feedback, feel free to reach out to b11013112@uch.edu.tw.
