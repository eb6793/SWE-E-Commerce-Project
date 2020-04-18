import React, { Component } from "react";
import { ProductConsumer } from "../../context-product";
import { Link } from "react-router-dom";
import { ButtonContainer } from "../General/Button";

export default class Details extends Component {
    render() {
        return (
            <ProductConsumer>
                {(value) => {
                    const {
                        id,
                        company,
                        img,
                        info,
                        price,
                        title,
                        inCart,
                    } = value.detailProduct;
                    return (
                        <div className="container py-5">
                            {/* title */}
                            <div className="row">
                                <div className="col-10 mx-auto text-center text-slanted text-black my-5">
                                    <h1>{title}</h1>
                                </div>
                            </div>
                            {/* end title */}
                            {/* product info */}
                            <div className="row">
                                <div className="col-10 mx-auto col-md-6 my-3">
                                    <img
                                        src={img}
                                        className="img-fluid"
                                        alt="product"
                                    />
                                </div>
                                {/* product text */}
                                <div className="col-10 mx-auto col-md-6 my-3 text-capitalize">
                                    <h2>Brand: {title}</h2>
                                    <h4 className="text-uppercase text-black mt-3 mb-2">
                                        made by:{" "}
                                        <span className="text-uppercase">
                                            {company}
                                        </span>
                                    </h4>
                                    <h4 className="text-black">
                                        <strong>
                                            price : <span>$</span>
                                            {price}
                                        </strong>
                                    </h4>
                                    <p className="text-capitalize font-weight-bold mt-3 mb-0">
                                        Product Information:
                                    </p>
                                    <p className="text-muted lead">{info}</p>
                                    {/* button */}
                                    <div>
                                        <Link to="/">
                                            <ButtonContainer>
                                                Back to Products
                                            </ButtonContainer>
                                        </Link>

                                        <ButtonContainer
                                            cart
                                            disabled={inCart ? true : false}
                                            onClick={() => {
                                                value.addToCart(id);
                                                value.openModal(id);
                                            }}
                                        >
                                            {inCart ? "in Cart" : "add to cart"}
                                        </ButtonContainer>
                                    </div>
                                </div>
                            </div>
                            {/* end product info */}
                        </div>
                    );
                }}
            </ProductConsumer>
        );
    }
}
