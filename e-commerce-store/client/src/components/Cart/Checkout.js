import { ProductConsumer } from "../../context-product";
import React, { Component } from "react";
import Title from "../../components/General/Title";
import { Redirect } from "react-router-dom";
import axios from "axios";

function HandleDisplayErrors(props) {
    let buffer = [];
    if (props.display_errors) {
        if (!props.address_verified) {
            buffer.push(
                <div key="address1" style={{ color: "red" }}>
                    * Please enter a valid Shipping Address.
                </div>
            );
        }
    }
    return <div style={{ padding: 10 }}>{buffer}</div>;
}

export default class Checkout extends Component {
    constructor(props) {
        super(props);
        // Assign state itself, and a default value for items
        this.state = {
            address_line1: "",
            address_line2: "",
            address_secondary: "",
            address_zipcode: "",
            address_city: "",
            address_state: "",

            email_address: "",
            isAddressChanged: false,
            id: "",
            first_name: "",
            last_name: "",

            order_confirmed: false,
        };

        this.address_verified = true;
        this.display_errors = false;
        this.cart = [];
        this.clearCart = [];
        this.OrderID = "";
    }

    async componentDidMount() {
        await this.sessionCheck();
        await this.loadUserValues();
        this.forceUpdate();
    }

    verifyShippingAddress() {
        return new Promise((resolve) => {
            const SmartyStreetsSDK = require("smartystreets-javascript-sdk");
            const SmartyStreetsCore = SmartyStreetsSDK.core;
            const Lookup = SmartyStreetsSDK.usStreet.Lookup;

            let authId = 24176270692624972; // created on smartystreets account page for localhost
            let authToken = process.env.SMARTY_AUTH_TOKEN;
            const credentials = new SmartyStreetsCore.StaticCredentials(
                authId,
                authToken
            );

            let verifyAddress = SmartyStreetsCore.buildClient.usStreet(
                credentials
            );

            let batch = new SmartyStreetsCore.Batch();
            let lookup1 = new Lookup();

            lookup1.street = this.state.address_line1;
            lookup1.street2 = this.state.address_line2;
            lookup1.secondary = this.state.address_secondary;
            lookup1.city = this.state.address_city;
            lookup1.state = this.state.address_state;
            lookup1.zipCode = this.state.address_zipcode;
            lookup1.match = "invalid"; // "invalid" is the most permissive match
            batch.add(lookup1);
            verifyAddress
                .send(batch)
                .then((response) => {
                    response.lookups.map((lookup) => {
                        if (lookup.result[0].analysis.dpvMatchCode === "Y") {
                            let res = lookup.result[0].lastLine.split(" ");
                            this.setState({
                                address_line1: lookup.result[0].deliveryLine1,
                                address_line2: lookup.result[0].deliveryLine2,
                                address_city: res[0],
                                address_state: res[1],
                                address_zipcode: res[2],
                            });
                            this.address_verified = true;
                        } else {
                            this.address_verified = false;
                        }
                        return null;
                    });
                    resolve("resolved");
                })
                .catch(() => {
                    this.address_verified = false;
                    resolve("resolved");
                });
        });
    }

    postOrdertoDB() {
        return new Promise((resolve) => {
            axios
                .post(
                    "http://localhost:4000/catweallgetalong/orders/new-order",
                    this.cart
                )
                .then((response) => {
                    this.OrderID = response.data;
                    resolve("done");
                })
                .catch(function (error) {
                    console.log(error);
                    resolve("done");
                });
        });
    }

    updateAccountWithOrderId() {
        return new Promise((resolve) => {
            axios
                .post(
                    "http://localhost:4000/catweallgetalong/accounts/update",
                    {
                        _id: this.state.id,
                        orderId: this.OrderID,
                    }
                )
                .then(function (response) {
                    console.log(response);
                    resolve("resolved");
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    loadUserValues() {
        return new Promise((resolve) => {
            axios
                .get(
                    "http://localhost:4000/catweallgetalong/sessions/user-info"
                )
                .then((response) => {
                    this.setState({
                        address_line1:
                            response.data[0].shipping_address[0].street1,
                        address_line2:
                            response.data[0].shipping_address[0].street2,
                        address_secondary:
                            response.data[0].shipping_address[0].secondary,
                        address_zipcode:
                            response.data[0].shipping_address[0].zipcode,
                        address_city: response.data[0].shipping_address[0].city,
                        address_state:
                            response.data[0].shipping_address[0].state,
                        email_address: response.data[0].email_address,
                        first_name: response.data[0].first_name,
                        last_name: response.data[0].last_name,
                        id: response.data[0]._id,
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
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

    async handleOnSubmit(event) {
        event.preventDefault();

        // check address is valid
        if (
            this.state.address_line1.length > 0 &&
            this.state.address_city.length > 0 &&
            this.state.address_state.length > 0 &&
            this.state.address_zipcode.length > 0 &&
            this.isAddressChanged
        ) {
            await this.verifyShippingAddress();
        }

        if (this.address_verified) {
            // create order in db, and retrive the ID
            await this.postOrdertoDB();
            // add order id to account order_history
            await this.updateAccountWithOrderId();
            // show order confirmed with order id
            this.setState({
                order_confirmed: true,
            });
        } else {
            // inject red text informing what to fix
            this.display_errors = true;
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        // clear cart
        this.clearCart();
    }

    render() {
        if (this.state.order_confirmed) {
            return (
                <div className="container mt-5">
                    <div className="row">
                        <div className="col-10 mx-auto text-center text-black">
                            <h1 className="mb-5">Your Order Was Confirmed</h1>

                            <h5>Order Number: {this.OrderID}</h5>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <ProductConsumer>
                {(value) => {
                    const { cart, clearCart } = value;
                    if (cart.length < 1) return <Redirect push to="/cart" />;
                    else {
                        this.cart = cart;
                        this.clearCart = clearCart;
                        return (
                            <React.Fragment>
                                <div style={{ margin: 50 }}>
                                    <Title
                                        name="Confirm"
                                        title="Shipping Address"
                                    />
                                    <HandleDisplayErrors
                                        display_errors={this.display_errors}
                                        address_verified={this.address_verified}
                                    />
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="addLine1">
                                                Address Line 1
                                            </label>
                                            <input
                                                type="address"
                                                className="form-control"
                                                id="addLine1"
                                                placeholder="3901 SW 154th Ave"
                                                onChange={(event) =>
                                                    this.setState(
                                                        {
                                                            address_line1:
                                                                event.target
                                                                    .value,
                                                        },
                                                        () => {
                                                            this.isAddressChanged = true;
                                                        }
                                                    )
                                                }
                                                value={this.state.address_line1}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="addLine2">
                                                Address Line 2
                                            </label>
                                            <input
                                                type="address"
                                                className="form-control"
                                                id="addLine2"
                                                placeholder="closest under the street"
                                                onChange={(event) =>
                                                    this.setState(
                                                        {
                                                            address_line2:
                                                                event.target
                                                                    .value,
                                                        },
                                                        () => {
                                                            this.isAddressChanged = true;
                                                        }
                                                    )
                                                }
                                                value={this.state.address_line2}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="secondary">
                                                Apt / Suite / Other
                                            </label>
                                            <input
                                                type="address"
                                                className="form-control"
                                                id="secondary"
                                                placeholder="Apt# 314"
                                                onChange={(event) =>
                                                    this.setState(
                                                        {
                                                            address_secondary:
                                                                event.target
                                                                    .value,
                                                        },
                                                        () => {
                                                            this.isAddressChanged = true;
                                                        }
                                                    )
                                                }
                                                value={
                                                    this.state.address_secondary
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="city">City</label>
                                            <input
                                                type="address"
                                                className="form-control"
                                                id="city"
                                                placeholder="Davie"
                                                onChange={(event) =>
                                                    this.setState(
                                                        {
                                                            address_city:
                                                                event.target
                                                                    .value,
                                                        },
                                                        () => {
                                                            this.isAddressChanged = true;
                                                        }
                                                    )
                                                }
                                                value={this.state.address_city}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="zip">Zipcode</label>
                                            <input
                                                type="address"
                                                className="form-control"
                                                id="zip"
                                                placeholder="33331"
                                                onChange={(event) =>
                                                    this.setState(
                                                        {
                                                            address_zipcode:
                                                                event.target
                                                                    .value,
                                                        },
                                                        () => {
                                                            this.isAddressChanged = true;
                                                        }
                                                    )
                                                }
                                                value={
                                                    this.state.address_zipcode
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label
                                                htmlFor="state"
                                                className="col-s control-label"
                                            >
                                                State
                                            </label>
                                            <div className="col-s">
                                                <select
                                                    className="form-control"
                                                    id="state"
                                                    name="state"
                                                    onChange={(event) =>
                                                        this.setState(
                                                            {
                                                                address_state:
                                                                    event.target
                                                                        .value,
                                                            },
                                                            () => {
                                                                this.isAddressChanged = true;
                                                            }
                                                        )
                                                    }
                                                    value={
                                                        this.state.address_state
                                                    }
                                                >
                                                    <option value="">
                                                        N/A
                                                    </option>
                                                    <option value="AK">
                                                        Alaska
                                                    </option>
                                                    <option value="AL">
                                                        Alabama
                                                    </option>
                                                    <option value="AR">
                                                        Arkansas
                                                    </option>
                                                    <option value="AZ">
                                                        Arizona
                                                    </option>
                                                    <option value="CA">
                                                        California
                                                    </option>
                                                    <option value="CO">
                                                        Colorado
                                                    </option>
                                                    <option value="CT">
                                                        Connecticut
                                                    </option>
                                                    <option value="DC">
                                                        District of Columbia
                                                    </option>
                                                    <option value="DE">
                                                        Delaware
                                                    </option>
                                                    <option value="FL">
                                                        Florida
                                                    </option>
                                                    <option value="GA">
                                                        Georgia
                                                    </option>
                                                    <option value="HI">
                                                        Hawaii
                                                    </option>
                                                    <option value="IA">
                                                        Iowa
                                                    </option>
                                                    <option value="ID">
                                                        Idaho
                                                    </option>
                                                    <option value="IL">
                                                        Illinois
                                                    </option>
                                                    <option value="IN">
                                                        Indiana
                                                    </option>
                                                    <option value="KS">
                                                        Kansas
                                                    </option>
                                                    <option value="KY">
                                                        Kentucky
                                                    </option>
                                                    <option value="LA">
                                                        Louisiana
                                                    </option>
                                                    <option value="MA">
                                                        Massachusetts
                                                    </option>
                                                    <option value="MD">
                                                        Maryland
                                                    </option>
                                                    <option value="ME">
                                                        Maine
                                                    </option>
                                                    <option value="MI">
                                                        Michigan
                                                    </option>
                                                    <option value="MN">
                                                        Minnesota
                                                    </option>
                                                    <option value="MO">
                                                        Missouri
                                                    </option>
                                                    <option value="MS">
                                                        Mississippi
                                                    </option>
                                                    <option value="MT">
                                                        Montana
                                                    </option>
                                                    <option value="NC">
                                                        North Carolina
                                                    </option>
                                                    <option value="ND">
                                                        North Dakota
                                                    </option>
                                                    <option value="NE">
                                                        Nebraska
                                                    </option>
                                                    <option value="NH">
                                                        New Hampshire
                                                    </option>
                                                    <option value="NJ">
                                                        New Jersey
                                                    </option>
                                                    <option value="NM">
                                                        New Mexico
                                                    </option>
                                                    <option value="NV">
                                                        Nevada
                                                    </option>
                                                    <option value="NY">
                                                        New York
                                                    </option>
                                                    <option value="OH">
                                                        Ohio
                                                    </option>
                                                    <option value="OK">
                                                        Oklahoma
                                                    </option>
                                                    <option value="OR">
                                                        Oregon
                                                    </option>
                                                    <option value="PA">
                                                        Pennsylvania
                                                    </option>
                                                    <option value="PR">
                                                        Puerto Rico
                                                    </option>
                                                    <option value="RI">
                                                        Rhode Island
                                                    </option>
                                                    <option value="SC">
                                                        South Carolina
                                                    </option>
                                                    <option value="SD">
                                                        South Dakota
                                                    </option>
                                                    <option value="TN">
                                                        Tennessee
                                                    </option>
                                                    <option value="TX">
                                                        Texas
                                                    </option>
                                                    <option value="UT">
                                                        Utah
                                                    </option>
                                                    <option value="VA">
                                                        Virginia
                                                    </option>
                                                    <option value="VT">
                                                        Vermont
                                                    </option>
                                                    <option value="WA">
                                                        Washington
                                                    </option>
                                                    <option value="WI">
                                                        Wisconsin
                                                    </option>
                                                    <option value="WV">
                                                        West Virginia
                                                    </option>
                                                    <option value="WY">
                                                        Wyoming
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-success text-uppercase mb-3 px-5"
                                            onClick={this.handleOnSubmit.bind(
                                                this
                                            )}
                                        >
                                            Submit Order
                                        </button>
                                    </form>
                                </div>
                            </React.Fragment>
                        );
                    }
                }}
            </ProductConsumer>
        );
    }
}
