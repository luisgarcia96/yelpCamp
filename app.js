const express = require('express');
const app = express();
const path = require('path');
const port = 3000

//Configuration générale pour l'application Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  res.render('home.ejs');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})