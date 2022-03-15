const mongoose = require('mongoose');

const mongoDb = process.env.MONGODB_URI || process.env.MONGODB_DEV;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
