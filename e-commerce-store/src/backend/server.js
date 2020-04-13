// Dependencies set-up
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Express Router instance
const productRoutes = express.Router();
let Product = require('./product.model');


// Connecting to mongo db
mongoose.connect('mongodb://127.0.0.1:27017/products', {useNewUrlParser:true});
const connection = mongoose.connection;

connection.once('open', function() {
    console.log("/*****************************/");
    console.log("Database for product list");
    console.log("MongoDB database connection established successfully");
});

// Endpoint creation
productRoutes.route('/').get(function(req, res) {
    Product.find(function(err, products) {
        if (err) {
            console.log(err);
        } else {
            res.json(products);
        }
    });
});

// Endpoint for finding by id
productRoutes.route('/:productid').get(function(req,res) {
    let id = req.params.id;
    Product.findById(id, function(err, product) {
        res.json(product);
    });
});

// Endpoint for adding products
productRoutes.route('/add').post(function(req, res) {
    let product = new Product(req.body);
    product.save()
           .then(todo => {
               res.status(200).json({'product': 'product added sucessfully'});
           })
           .catch(err => {
               res.status(400).send('adding new product failed');
           });
});   

app.use('/products', productRoutes);

// Express server and attaching cors and body-parser
app.listen(PORT,function() {
    console.log("Connection success..");
    console.log("Server is running on Port: "+PORT);
    
});