const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Product = new Schema({
    id: {
        type: Number,
    },
    title: {
        type: String,
    },
    img: {
        type: String,
    },
    price: {
        type: Number,
    },
    company: {
        type: String,
    },
    info: {
        type: String,
    },
    inCart: {
        type: Boolean,
    },
    count: {
        type: Number,
    },
    total: {
        type: Number,
    },
});

module.exports = mongoose.model("Product", Product);
