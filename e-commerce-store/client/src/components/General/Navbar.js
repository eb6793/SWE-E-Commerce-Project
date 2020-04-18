import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../../logo.png";
import styled from "styled-components";
import { ButtonContainer } from "./Button";

import "../../App.css";

export default class Navbar extends Component {
    render() {
        return (
            <NavWrapper className="navbar navar-expand-sm navbar-dark px-sm-6">
                <Link to="/">
                    <img src={logo} alt="store" className="navbar-brand" />
                </Link>
                <Link to="/">
                    <div className="nav-link nicePrettyfont">
                        CatWeAllGetAlong
                    </div>
                </Link>
                <ul className="navbar-nav align-items-center">
                    <li className="nav-item ml-5">
                        <Link to="/about" className="nav-link">
                            About Us
                        </Link>
                    </li>
                </ul>
                <ul className="navbar-nav align-items-center">
                    <li className="nav-item ml-5">
                        <Link to="/" className="nav-link">
                            Products
                        </Link>
                    </li>
                </ul>

                <ul className="navbar-nav align-items-center">
                    <li className="nav-item ml-5">
                        <Link to="/account" className="nav-link">
                            Account
                        </Link>
                    </li>
                </ul>
                <Link to="/cart" className="ml-auto">
                    <ButtonContainer>
                        <span className="mr-2">
                            <i className="fas fa-cart-plus" />
                        </span>
                        my cart
                    </ButtonContainer>
                </Link>
            </NavWrapper>
        );
    }
}

const NavWrapper = styled.nav`
    background: var(--mainBlue);
    .nav-link {
        color: var(--mainWhite) !important;
        font-size: 1.3rem;
        text-transform: capitalize;
    }
`;
