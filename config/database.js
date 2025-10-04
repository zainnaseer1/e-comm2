const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(
      `Database (${process.env.DB_NAME}) connection successful: ${conn.connection.host}`,
    );
    // }).catch(err => {
    //     console.error('Database connection error:', err);
    //     process.exit(1);
    // });
  });
};

module.exports = dbConnection;
