const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Account = new Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    email_address: {
        type: String,
    },
    password: {
        type: String,
    },
    shipping_address: {
        type: Array, // 0=line1 of address, 1=line2 of address, 2=city, 3=state, 4=postal code
    },
    order_history: {
        type: Array, // each index is an array of order IDs
    },
});

module.exports = mongoose.model("Account", Account);
