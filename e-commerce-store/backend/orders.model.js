const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Order = new Schema({
    order_details: {
        type: Array,
    },
});

module.exports = mongoose.model("Order", Order);
