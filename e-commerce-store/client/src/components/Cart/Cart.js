import React, { Component } from "react";
import Title from "../General/Title";
import CartColumns from "./CartColumns";
import EmptyCart from "./EmptyCart";
import { ProductConsumer } from "../../context-product";
import CartList from "./CartList";
import CartTotals from "./CartTotals";
import axios from "axios";

export default class Cart extends Component {
    constructor(props) {
        super(props);
        // Assign state itself, and a default value for items
        this.directTo = "/account";
    }

    sessionCheck() {
        return new Promise((resolve) => {
            axios
                .get("http://localhost:4000/catweallgetalong/sessions/")
                .then((res) => {
                    //do something
                    if (res.data === true) {
                        this.directTo = "/checkout";
                    } else {
                        this.directTo = "/account";
                    }

                    resolve("resolved");
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    async componentDidMount() {
        await this.sessionCheck();
        this.forceUpdate();
    }

    render() {
        return (
            <section>
                <ProductConsumer>
                    {(value) => {
                        const { cart } = value;
                        if (cart.length > 0) {
                            return (
                                <React.Fragment>
                                    <Title name="your" title="cart" />
                                    <CartColumns />
                                    <CartList value={value} />
                                    <CartTotals
                                        value={value}
                                        history={this.props.history}
                                        directTo={this.directTo}
                                    />
                                </React.Fragment>
                            );
                        } else {
                            return <EmptyCart />;
                        }
                    }}
                </ProductConsumer>
            </section>
        );
    }
}
