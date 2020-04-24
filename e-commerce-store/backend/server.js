// Dependencies set-up
const express = require("express");
const session = require("express-session"); // for cookies
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = 4000;
const NeverBounce = require("neverbounce");

// Initialize NeverBounce client
const client = new NeverBounce({
    apiKey: "private_b4a0a4b260e1007bcf61df05c519e4a3",
});

app.use(cors());
app.use(bodyParser.json());
app.use(session({ secret: "ssshhhhh", saveUninitialized: true, resave: true })); // for cookies

// Express Router instance
const productRoutes = express.Router();
let Product = require("./product.model");

// Express Router instance
const accountsRoutes = express.Router();
let accounts = require("./account.model");

// Express Router instance
const orderRoutes = express.Router();
let orders = require("./orders.model");

// Express Router instance
const sessionsRoutes = express.Router();

// Connecting to mongo db
mongoose.connect("mongodb://127.0.0.1:27017/catweallgetalong", {
    useNewUrlParser: true,
    useFindAndModify: false,
});
const connection = mongoose.connection;

connection.once("open", function () {
    console.log("/*****************************/");
    console.log("Database for product list");
    console.log("MongoDB database connection established successfully");
});

orderRoutes.post("/new-order", (req, res) => {
    let order = new orders({ order_details: req.body });
    order
        .save()
        .then((order) => {
            res.status(200).send(order._id);
        })
        .catch((err) => {
            res.status(400).send("adding new order failed");
        });
});

orderRoutes.get("/", (req, res) => {
    orders.find((err, orders) => {
        res.json(orders);
    });
});

var sess = []; // global session, NOT recommended
sess.exists = false;

// get if user is logged in
sessionsRoutes.get("/", (req, res) => {
    if (sess.exists) {
        return res.send(true);
    } else {
        return res.send(false);
    }
});

// get user who is logged in, info
sessionsRoutes.get("/user-info", (req, res) => {
    if (sess.exists) {
        return res.json(sess.account);
    } else {
        return res.send(false);
    }
});

// post that user logged in
sessionsRoutes.post("/login", (req, res) => {
    // comfirm email_address exists
    accounts.find(
        { email_address: req.body.email },
        "-password",
        (err, accounts) => {
            if (err) {
                console.log(err);
            } else if (accounts.length < 1) {
                sess.exists = false;
                sess.email = "";
                sess.account = "";
                res.send("Error");
            } else {
                sess.exists = true;
                sess.email = req.body.email;
                sess.account = accounts;
                res.send("in");
            }
        }
    );
});

// post that user logged out
sessionsRoutes.post("/logout", (req, res) => {
    sess.exists = false;
    sess.email = "";
    sess.account = "";
    res.send("out");
});

// End point update account by id and update eveyrthing except password
accountsRoutes.route("/edit").post((req, res) => {
    accounts.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        {
            email_address: req.body.email_address,
            shipping_address: req.body.shipping_address,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
        },
        (err, accounts) => {
            if (err) {
                res.send(err);
            } else {
                res.json(accounts);
            }
        }
    );
});

// End point update account by id and push order history
accountsRoutes.route("/update").post((req, res) => {
    accounts.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        {
            $push: { order_history: mongoose.Types.ObjectId(req.body.orderId) },
        },
        (err, accounts) => {
            if (err) {
                res.send(err);
            } else {
                res.json(accounts);
            }
        }
    );
});

// Endpoint Read product
productRoutes.route("/").get(function (req, res) {
    Product.find(function (err, products) {
        if (err) {
            console.log(err);
        } else {
            res.json(products);
        }
    });
});

// Endpoint Read account
accountsRoutes.route("/").get(function (req, res) {
    accounts.find(function (err, accounts) {
        if (err) {
            console.log(err);
        } else {
            res.json(accounts);
        }
    });
});

// Endpoint Read account
accountsRoutes.route("/nb/:email").get(function (req, res) {
    // Verify an email
    // console.log(req.params.email);
    client.single.check(req.params.email).then(
        (result) => {
            res.send(result.getResult()); // prints: "valid"
            // See VerificationObject for additional helper methods for working with
            // verification results from the the single method
        },
        (err) => {
            // Errors are returned by the Promise in the form of rejection. To
            // gracefully handle errors you can use a switch or if statements to
            // catch specific error types.
            switch (err.type) {
                case NeverBounce.errors.AuthError:
                    console.log(
                        "The API credentials used are bad, have you reset them recently?"
                    );
                    break;
                case NeverBounce.errors.BadReferrerError:
                    console.log(
                        "The script is being used from an unauthorized source, you may need to"
                    );
                    console.log(
                        "adjust your app's settings to allow it to be used from here"
                    );
                    break;
                case NeverBounce.errors.ThrottleError:
                    console.log(
                        "Too many requests in a short amount of time, try again shortly or adjust"
                    );
                    console.log(
                        "your rate limit settings for this application in the dashboard"
                    );
                    break;
                case NeverBounce.errors.GeneralError:
                    console.log(
                        "A non recoverable API error occurred check the message for details"
                    );
                    break;
                default:
                    console.log("Other non specific errors");
                    break;
            }
        }
    );
});

// Endpoints for delete by id (products)
productRoutes.route("/delete/:id").delete(function (req, res) {
    Product.findByIdAndDelete(req.params.id, function (err, product) {
        if (err) return next(err);
        res.json(product);
    });
});

// Endpoint for delete by id (accounts)
accountsRoutes.route("/delete/:id").delete(function (req, res) {
    accounts.findByIdAndDelete(req.params.id, function (err, account) {
        if (err) return next(err);
        res.json(account);
    });
});

// Endpoint for finding by id (products)
productRoutes.route("/:id").get(function (req, res) {
    Product.findById(req.params.id, function (err, product) {
        res.json(product);
    });
});

// Endpoint for finding by id (accounts)
accountsRoutes.route("/:id").get(function (req, res) {
    accounts.findById(req.params.id, function (err, account) {
        res.json(account);
    });
});

// Endpoint for adding products
productRoutes.route("/add").post(function (req, res) {
    let product = new Product(req.body);
    product
        .save()
        .then((todo) => {
            res.status(200).json({ product: "product added sucessfully" });
        })
        .catch((err) => {
            res.status(400).send("adding new product failed");
        });
});

// Endpoint for adding accounts
accountsRoutes.route("/add").post(function (req, res) {
    let account = new accounts(req.body);
    account
        .save()
        .then((account) => {
            res.status(200).json({ account: "account added sucessfully" });
        })
        .catch((err) => {
            res.status(400).send("adding new account failed");
        });
});

/* *********************************************************************** */

// Endpoint check if email address exist and 1 or 0
accountsRoutes.route("/email/:email").get(function (req, res) {
    // find query with email address, and only return COUNT
    accounts.countDocuments(
        { email_address: req.params.email },
        (err, accounts) => {
            if (err) {
                console.log(err);
            } else {
                res.json(accounts);
            }
        }
    );
});

// Endpoint check if password matches email address
accountsRoutes.route("/login/:email/:pwd").get(function (req, res) {
    // find query with email address and password, and only return COUNT
    accounts.countDocuments(
        { email_address: req.params.email, password: req.params.pwd },
        (err, accounts) => {
            if (err) {
                console.log(err);
            } else {
                res.json(accounts);
            }
        }
    );
});

/* *********************************************************************** */

app.use("/catweallgetalong/products", productRoutes);
app.use("/catweallgetalong/accounts", accountsRoutes);
app.use("/catweallgetalong/sessions", sessionsRoutes);
app.use("/catweallgetalong/orders", orderRoutes);

// Express server and attaching cors and body-parser
app.listen(PORT, function () {
    console.log("Connection success..");
    console.log("Server is running on Port: " + PORT);
});
