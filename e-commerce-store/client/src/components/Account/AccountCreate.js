import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import Title from "../../components/General/Title";
import axios from "axios";

function HandleDisplayErrors(props) {
    let buffer = [];
    if (props.display_errors) {
        if (props.email_isDuplicate) {
            buffer.push(
                <div key="email1" style={{ color: "red" }}>
                    * Email Address is already in use.
                </div>
            );
        } else {
            if (!props.address_verified) {
                buffer.push(
                    <div key="address1" style={{ color: "red" }}>
                        * Please enter a valid Shipping Address.
                    </div>
                );
            }
            if (!props.email_verified) {
                buffer.push(
                    <div key="email2" style={{ color: "red" }}>
                        * Please enter a valid Email Address.
                    </div>
                );
            }
            if (!props.password_is8Chars) {
                buffer.push(
                    <div key="pass1" style={{ color: "red" }}>
                        * Password must be at least 8 characters.
                    </div>
                );
            }
            if (!props.name_isInputted) {
                buffer.push(
                    <div key="names1" style={{ color: "red" }}>
                        * Please enter a First and Last Name.
                    </div>
                );
            }
        }
    }
    return <div style={{ padding: 10 }}>{buffer}</div>;
}

class AccountCreate extends Component {
    constructor(props) {
        super(props);
        // Assign state itself, and a default value for items
        this.state = {
            first_name: "",
            last_name: "",
            email_address: "",
            password: "",
            address_line1: "",
            address_line2: "",
            address_secondary: "",
            address_zipcode: "",
            address_city: "",
            address_state: "",
            redirect: false,
        };

        this.address_verified = false;
        this.email_verified = false;
        this.email_isDuplicate = false;
        this.password_is8Chars = false;
        this.name_isInputted = false;
        this.display_errors = false;
    }

    checkDuplicateEmail() {
        return new Promise((resolve) => {
            axios
                .get(
                    "http://localhost:4000/catweallgetalong/accounts/email/" +
                        this.state.email_address
                )
                .then((res) => {
                    this.email_isDuplicate = res.data > 0;
                    resolve("resolved");
                })
                .catch(function (error) {
                    console.log(error);
                    //call the function again?
                });
        });
    }

    addAccountToDB() {
        return new Promise((resolve) => {
            console.log(this.state.address_secondary);
            axios
                .post("http://localhost:4000/catweallgetalong/accounts/add", {
                    first_name: this.state.first_name,
                    last_name: this.state.last_name,
                    email_address: this.state.email_address,
                    password: this.state.password,
                    shipping_address: {
                        street1: this.state.address_line1,
                        street2: this.state.address_line2,
                        secondary: this.state.address_secondary,
                        city: this.state.address_city,
                        state: this.state.address_state,
                        zipcode: this.state.address_zipcode,
                    },
                    order_history: [],
                })
                .then(function (response) {
                    resolve("resolved");
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
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
                                address_line1: lookup.result[0].deliveryLine1.substring(
                                    0,
                                    this.state.address_line1.length
                                ),
                                address_city: res[0],
                                address_state: res[1],
                                address_zipcode: res[2],
                            });
                            if (lookup.result[0].deliveryLine2 != null) {
                                this.setState({
                                    address_line2:
                                        lookup.result[0].deliveryLine2,
                                });
                            }
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

    checkValidityEmail() {
        return new Promise((resolve) => {
            axios
                .get(
                    "http://localhost:4000/catweallgetalong/accounts/nb/" +
                        this.state.email_address
                )
                .then((response) => {
                    if (response.data === "valid") {
                        this.email_verified = true;
                    } else {
                        this.email_verified = false;
                    }
                    resolve("resolved");
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    addSession() {
        return new Promise((resolve) => {
            axios
                .post("http://localhost:4000/catweallgetalong/sessions/login", {
                    email: this.state.email_address,
                })
                .then((response) => {
                    if (response !== "Error") this.sessionAdded = true;
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
            this.state.address_zipcode.length > 0
        ) {
            await this.verifyShippingAddress();
        }

        // check email valid
        await this.checkValidityEmail();

        // check email duplicate db
        await this.checkDuplicateEmail();

        // verify password is 8 chars
        this.password_is8Chars = this.state.password.length > 7;

        //verify that all REQUIRED inputs are filled (HINT: make a state variable to update the check of this)
        this.name_isInputted =
            this.state.first_name.length > 0 && this.state.last_name.length > 0;

        if (
            this.address_verified &&
            this.email_verified &&
            !this.email_isDuplicate &&
            this.password_is8Chars &&
            this.name_isInputted
        ) {
            // add to account to db
            await this.addAccountToDB();
            // log user in via db
            await this.addSession();
            // logged in so redirect to /cart
            if (this.sessionAdded) {
                //redirect to cart
                this.setState({
                    redirect: true,
                });
            }
        } else {
            // inject red text informing what to fix
            this.display_errors = true;
            this.forceUpdate();
        }
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push to="/cart" />;
        }
        return (
            <React.Fragment>
                <div>
                    <Title name="Create" title="Account" />
                    <HandleDisplayErrors
                        display_errors={this.display_errors}
                        address_verified={this.address_verified}
                        email_verified={this.email_verified}
                        email_isDuplicate={this.email_isDuplicate}
                        password_is8Chars={this.password_is8Chars}
                        name_isInputted={this.name_isInputted}
                    />
                    <Link
                        to="/account"
                        onClick={(hasAccount) => {
                            this.props.parentCallback(true);
                        }}
                    >
                        Have an account? Click Here!
                    </Link>
                    <form>
                        <div className="form-group">
                            <label htmlFor="inputFirstName">First Name</label>
                            <input
                                type="name"
                                className="form-control"
                                id="inputFirstName"
                                placeholder="John"
                                onChange={(event) => {
                                    this.setState({
                                        first_name: event.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="inputLastName">Last Name</label>
                            <input
                                type="name"
                                className="form-control"
                                id="inputLastName"
                                placeholder="Doe"
                                onChange={(event) =>
                                    this.setState({
                                        last_name: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="inputEmail">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="inputEmail"
                                aria-describedby="emailHelp"
                                placeholder="Enter email"
                                onChange={(event) => {
                                    this.setState({
                                        email_address: event.target.value.toLowerCase(),
                                    });
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="inputPass">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="inputPass"
                                placeholder="Password"
                                onChange={(event) => {
                                    this.setState({
                                        password: event.target.value,
                                    });
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="addLine1">Address Line 1</label>
                            <input
                                type="address"
                                className="form-control"
                                id="addLine1"
                                placeholder="3901 SW 154th Ave"
                                onChange={(event) =>
                                    this.setState({
                                        address_line1: event.target.value,
                                    })
                                }
                                value={this.state.address_line1}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="addLine2">Address Line 2</label>
                            <input
                                type="address"
                                className="form-control"
                                id="addLine2"
                                placeholder="closest under the street"
                                onChange={(event) =>
                                    this.setState({
                                        address_line2: event.target.value,
                                    })
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
                                    this.setState({
                                        address_secondary: event.target.value,
                                    })
                                }
                                value={this.state.address_secondary}
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
                                    this.setState({
                                        address_city: event.target.value,
                                    })
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
                                    this.setState({
                                        address_zipcode: event.target.value,
                                    })
                                }
                                value={this.state.address_zipcode}
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
                                        this.setState({
                                            address_state: event.target.value,
                                        })
                                    }
                                    value={this.state.address_state}
                                >
                                    <option value="">N/A</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AL">Alabama</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DC">
                                        District of Columbia
                                    </option>
                                    <option value="DE">Delaware</option>
                                    <option value="FL">Florida</option>
                                    <option value="GA">Georgia</option>
                                    <option value="HI">Hawaii</option>
                                    <option value="IA">Iowa</option>
                                    <option value="ID">Idaho</option>
                                    <option value="IL">Illinois</option>
                                    <option value="IN">Indiana</option>
                                    <option value="KS">Kansas</option>
                                    <option value="KY">Kentucky</option>
                                    <option value="LA">Louisiana</option>
                                    <option value="MA">Massachusetts</option>
                                    <option value="MD">Maryland</option>
                                    <option value="ME">Maine</option>
                                    <option value="MI">Michigan</option>
                                    <option value="MN">Minnesota</option>
                                    <option value="MO">Missouri</option>
                                    <option value="MS">Mississippi</option>
                                    <option value="MT">Montana</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="ND">North Dakota</option>
                                    <option value="NE">Nebraska</option>
                                    <option value="NH">New Hampshire</option>
                                    <option value="NJ">New Jersey</option>
                                    <option value="NM">New Mexico</option>
                                    <option value="NV">Nevada</option>
                                    <option value="NY">New York</option>
                                    <option value="OH">Ohio</option>
                                    <option value="OK">Oklahoma</option>
                                    <option value="OR">Oregon</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="PR">Puerto Rico</option>
                                    <option value="RI">Rhode Island</option>
                                    <option value="SC">South Carolina</option>
                                    <option value="SD">South Dakota</option>
                                    <option value="TN">Tennessee</option>
                                    <option value="TX">Texas</option>
                                    <option value="UT">Utah</option>
                                    <option value="VA">Virginia</option>
                                    <option value="VT">Vermont</option>
                                    <option value="WA">Washington</option>
                                    <option value="WI">Wisconsin</option>
                                    <option value="WV">West Virginia</option>
                                    <option value="WY">Wyoming</option>
                                </select>
                            </div>
                        </div>

                        <HandleDisplayErrors
                            display_errors={this.display_errors}
                            address_verified={this.address_verified}
                            email_verified={this.email_verified}
                            email_isDuplicate={this.email_isDuplicate}
                            password_is8Chars={this.password_is8Chars}
                            name_isInputted={this.name_isInputted}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={this.handleOnSubmit.bind(this)}
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}

export default AccountCreate;
