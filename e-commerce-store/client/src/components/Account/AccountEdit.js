import React, { Component } from "react";
import Title from "../../components/General/Title";
import { Redirect } from "react-router-dom";
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

export default class AccountEdit extends Component {
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
            isEmailChanged: false,
            id: "",
            first_name: "",
            last_name: "",
        };

        this.redirect = false;

        this.address_verified = false;
        this.email_verified = false;
        this.email_isDuplicate = false;
        this.name_isInputted = false;
        this.display_errors = false;
        this.originalEmail = "";
    }

    async componentDidMount() {
        await this.loadUserValues();
        this.originalEmail = this.state.email_address;
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

    updateAccountInDB() {
        return new Promise((resolve) => {
            axios
                .post("http://localhost:4000/catweallgetalong/accounts/edit", {
                    shipping_address: [
                        {
                            street1: this.state.address_line1,
                            street2: this.state.address_line2,
                            secondary: this.state.secondary,
                            city: this.state.address_city,
                            state: this.state.address_state,
                            zipcode: this.state.address_zipcode,
                        },
                    ],
                    _id: this.state.id,
                    first_name: this.state.first_name,
                    last_name: this.state.last_name,
                    email_address: this.state.email_address,
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

    removeSession() {
        return new Promise((resolve) => {
            axios
                .post("http://localhost:4000/catweallgetalong/sessions/logout")
                .then((response) => {
                    if (response === "out") this.sessionAdded = true;
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

    async logoutUser() {
        // remove session
        await this.removeSession();
        // redirect to "/"
        this.redirect = true;
        this.forceUpdate();
        // refresh page (will eliminate cart!)
        window.location.reload(false);
    }

    checkEmailChanged() {
        return new Promise((resolve) => {
            if (this.originalEmail === this.state.email_address) {
                this.setState(
                    {
                        isEmailChanged: false,
                    },
                    resolve("resolved")
                );
            } else {
                this.setState(
                    {
                        isEmailChanged: false,
                    },
                    resolve("resolved")
                );
            }
        });
    }

    async handleOnSubmit(event) {
        event.preventDefault();
        await this.checkEmailChanged();
        // check address is valid
        if (
            this.state.address_line1.length > 0 &&
            this.state.address_city.length > 0 &&
            this.state.address_state.length > 0 &&
            this.state.address_zipcode.length > 0
        ) {
            await this.verifyShippingAddress();
        }

        // check email duplicate db only if they changed the value!
        if (this.state.isEmailChanged) {
            await this.checkDuplicateEmail();

            // check email valid
            await this.checkValidityEmail();
        } else {
            this.email_verified = true;
            this.email_isDuplicate = false;
        }

        //verify that all REQUIRED inputs are filled
        this.name_isInputted =
            this.state.first_name.length > 0 && this.state.last_name.length > 0;

        if (
            this.address_verified &&
            this.email_verified &&
            !this.email_isDuplicate &&
            this.name_isInputted
        ) {
            // post accounts update by id
            await this.updateAccountInDB();
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
            return <Redirect to="/" />;
        }
        return (
            <React.Fragment>
                <div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={this.logoutUser.bind(this)}
                        >
                            Logout
                        </button>
                    </div>
                    <Title name="Edit" title="Account" />
                    <HandleDisplayErrors
                        display_errors={this.display_errors}
                        address_verified={this.address_verified}
                        email_verified={this.email_verified}
                        email_isDuplicate={this.email_isDuplicate}
                        name_isInputted={this.name_isInputted}
                    />

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
                                value={this.state.first_name}
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
                                value={this.state.last_name}
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
                                        isEmailChanged: true,
                                    });
                                }}
                                value={this.state.email_address}
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
                            name_isInputted={this.name_isInputted}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={this.handleOnSubmit.bind(this)}
                        >
                            Edit Account
                        </button>
                    </form>
                </div>
            </React.Fragment>
        );
    }
}
