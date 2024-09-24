const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique:true},
    password: {type: String, required: true}
}, {
    timestamps: true
});

userSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

userSchema.methods.matchPassword = async function(password, passwordBD){
    return await bcrypt.compare(password, passwordBD)
}

const User = mongoose.model('User', userSchema);

module.exports = User;