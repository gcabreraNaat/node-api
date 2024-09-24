const mongoose = require('mongoose');

const {APP_MONGODB_HOST, APP_MONGODB_PORT, APP_MONGODB_DATABASE} = process.env;
const mongodbUrl = `mongodb://${APP_MONGODB_HOST}${APP_MONGODB_PORT}/${APP_MONGODB_DATABASE}`;

mongoose.connect(mongodbUrl).then(() => console.log('Database is connected')
    ).catch(err => console.error(err));