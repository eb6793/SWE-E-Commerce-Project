import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/General/Navbar";
import ProductList from "./components/Product/ProductList";
import Details from "./components/Product/Details";
import Cart from "./components/Cart/Cart";
import Default from "./components/General/Default";
import About from "./components/General/About";
import Modal from "./components/General/Modal";
import Account from "./components/Account/Account";
import Checkout from "./components/Cart/Checkout";

class App extends Component {
    render() {
        return (
            <React.Fragment>
                <Navbar />
                <Switch>
                    <Route exact path="/" component={ProductList}></Route>
                    <Route path="/about" component={About}></Route>
                    <Route path="/details" component={Details}></Route>
                    <Route path="/cart" component={Cart}></Route>
                    <Route path="/account" component={Account}></Route>
                    <Route path="/checkout" component={Checkout}></Route>
                    <Route component={Default}></Route>
                </Switch>
                <Modal />
            </React.Fragment>
        );
    }
}

export default App;
