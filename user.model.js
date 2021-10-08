const mongoose = require('mongoose');

const { model, Schema} = require('mongoose');

const userModel = new Schema(
    {
        username: {type: String, required: true},
        password: {type: String, required: true},
        data: {type: Date, default: Date.now}
    }
)

module.exports = model('User', userModel);