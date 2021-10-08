const mongoose = require('mongoose');

const mongo_url = "mongodb://localhost/chatdb";
//const mongo_url = process.env.mongo_url_dev;

mongoose.connect(mongo_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
})

   .then(db => console.log('Database started correctly'))
   .catch(err => console.log(err));