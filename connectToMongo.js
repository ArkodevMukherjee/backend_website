const mongoose = require('mongoose');
const  connectToMongo = () => {
mongoose.connect('mongodb+srv://arkodevm:SLAKXO8KDZFB9EAp@cluster0.4kvxl.mongodb.net/Blog-Web');
}
module.exports = {connectToMongo:connectToMongo};