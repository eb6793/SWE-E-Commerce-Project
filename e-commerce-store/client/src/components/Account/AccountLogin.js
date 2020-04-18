import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import Title from "../../components/General/Title";
import axios from "axios";

export default class AccountLogin extends Component {
    constructor(props) {
        super(props);
        // Assign state itself, and a default value for items
        this.state = {
            email_address: "",
            password: "",
            redirect: false,
        };

        this.authenticated = false;
        this.submitedOnce = false;
        this.sessionAdded = false;
    }

    checkCredentials() {
        return new Promise((resolve) => {
            axios
                .get(
                    "http://localhost:4000/catweallgetalong/accounts/login/" +
                        this.state.email_address +
                        "/" +
                        this.state.password
                )
                .then((res) => {
                    this.authenticated = res.data > 0;
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

        // make call to db for check
        await this.checkCredentials();
        this.submitedOnce = true;

        if (this.authenticated) {
            console.log("Credientials Valid!");
            await this.addSession();
            if (this.sessionAdded) {
                //redirect to cart
                this.setState({
                    redirect: true,
                });
            }
        } else {
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
                    <Title name="Log" title="In" />
                    <Link
                        to="/account"
                        onClick={(hasAccount) => {
                            this.props.parentCallback(false);
                        }}
                    >
                        Don't have an account? Click Here!
                    </Link>
                    <form>
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

                        {!this.authenticated && this.submitedOnce ? (
                            <div
                                key="names1"
                                style={{ color: "red", padding: 10 }}
                            >
                                * Please try again
                            </div>
                        ) : (
                            <></>
                        )}

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
