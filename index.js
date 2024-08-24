const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { sequelize } = require('./models');
const apiRouter = require('./routes/api');

app.use(express.json());

app.use(cors()); 

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');

    app.use('/', apiRouter);

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });