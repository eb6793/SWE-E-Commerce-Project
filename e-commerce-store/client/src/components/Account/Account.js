import React, { Component } from "react";
import AccountLogin from "./AccountLogin";
import AccountCreate from "./AccountCreate";
import AccountEdit from "./AccountEdit";
import axios from "axios";

class Account extends Component {
    constructor(props) {
        super(props);
        // Assign state itself, and a default value for items
        this.state = {
            hasAccount: [],
        };
        this.isLoggedIn = false;
    }

    sessionCheck() {
        return new Promise((resolve) => {
            axios
                .get("http://localhost:4000/catweallgetalong/sessions/")
                .then((res) => {
                    //do something
                    if (res.data === true) {
                        this.isLoggedIn = true;
                    } else {
                        this.isLoggedIn = false;
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

    UNSAFE_componentWillMount() {
        this.setState({ hasAccount: false });
    } // had to do UNSAFE_ for some reason?

    callbackFunction = (childData) => {
        this.setState({ hasAccount: childData });
    };

    render() {
        return (
            <React.Fragment>
                <div className="py-5">
                    <div className="container">
                        {this.isLoggedIn ? (
                            <AccountEdit />
                        ) : this.state.hasAccount ? (
                            <AccountLogin
                                parentCallback={this.callbackFunction}
                            />
                        ) : (
                            <AccountCreate
                                parentCallback={this.callbackFunction}
                            />
                        )}
                        <div className="row"></div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Account;
