import React, { Component } from "react";
// removed storeProducts from {}
// added for testing 4/10
import axios from "axios";

const ProductContext = React.createContext(); // *********
//Provider
//Consumer

class ProductProvider extends Component {
    state = {
        products: [],
        detailProduct: [],
        cart: [],
        modalOpen: false,
        modalProduct: [],
        cartSubTotal: 0,
        cartTax: 0,
        cartTotal: 0,
    };

    /*componentDidMount(){
        this.setProducts();
    }*/

    // altered for testing

    setProducts = () => {
        axios
            .get("http://localhost:4000/catweallgetalong/products/")
            .then((response) => {
                this.setState({ products: response.data });
            })
            .catch(function (error) {
                console.log(error);
            });
        /*
        storeProducts.forEach(item =>{
            const singleItem = {...item};
            tempProducts = [...tempProducts,singleItem];

        })
        this.setState(()=>{
            return {products:tempProducts}
        })*/
    };

    componentDidMount() {
        axios
            .get("http://localhost:4000/catweallgetalong/products/")
            .then((response) => {
                this.setState({ products: response.data });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getItem = (id) => {
        const product = this.state.products.find((item) => item.id === id);
        return product;
    };

    handleDetail = (id) => {
        const product = this.getItem(id);
        this.setState(() => {
            return { detailProduct: product };
        });
    };

    // Since not using data, need to determine how to alter data
    addToCart = (id) => {
        let tempProducts = [...this.state.products];
        const index = tempProducts.indexOf(this.getItem(id));
        const product = tempProducts[index];
        product.inCart = true;
        product.count = 1;
        const price = product.price;
        product.total = price;
        this.setState(
            () => {
                return {
                    products: tempProducts,
                    cart: [...this.state.cart, product],
                };
            },
            () => {
                this.addTotals();
            }
        );
    };

    openModal = (id) => {
        const product = this.getItem(id);
        this.setState(() => {
            return { modalProduct: product, modalOpen: true };
        });
    };

    closeModal = () => {
        this.setState(() => {
            return { modalOpen: false };
        });
    };

    increment = (id) => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find((item) => item.id === id);
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];

        product.count = product.count + 1;
        product.total = product.count * product.price;

        this.setState(
            () => {
                return {
                    cart: [...tempCart],
                };
            },
            () => {
                this.addTotals();
            }
        );
    };

    decrement = (id) => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find((item) => item.id === id);
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];

        product.count = product.count - 1;
        if (product.count === 0) {
            this.removeItem(id);
        } else {
            product.total = product.count * product.price;

            this.setState(
                () => {
                    return {
                        cart: [...tempCart],
                    };
                },
                () => {
                    this.addTotals();
                }
            );
        }
    };

    removeItem = (id) => {
        let tempProducts = [...this.state.products];
        let tempCart = [...this.state.cart];

        tempCart = tempCart.filter((item) => item.id !== id);
        const index = tempProducts.indexOf(this.getItem(id));
        let removedProduct = tempProducts[index];
        removedProduct.inCart = false;
        removedProduct.count = 0;
        removedProduct.total = 0;

        this.setState(
            () => {
                return {
                    cart: [...tempCart],
                    products: [...tempProducts],
                };
            },
            () => {
                this.addTotals();
            }
        );
    };

    clearCart = () => {
        this.setState(
            () => {
                return { cart: [] };
            },
            () => {
                this.setProducts();
                this.addTotals();
            }
        );
    };

    addTotals = () => {
        let subTotal = 0;
        let tempCart = [...this.state.cart];
        this.state.cart.map((item) => (subTotal += item.total));
        const tempTax = subTotal * 0.0825;
        const tax = parseFloat(tempTax.toFixed(2));
        const total = subTotal + tax;
        this.setState(() => {
            return {
                cartSubTotal: subTotal,
                cartTax: tax,
                cartTotal: total,
                cartContents: tempCart,
            };
        });
    };

    render() {
        return (
            <ProductContext.Provider
                value={{
                    ...this.state,
                    handleDetail: this.handleDetail,
                    addToCart: this.addToCart,
                    openModal: this.openModal,
                    closeModal: this.closeModal,
                    increment: this.increment,
                    decrement: this.decrement,
                    removeItem: this.removeItem,
                    clearCart: this.clearCart,
                }}
            >
                {this.props.children}
            </ProductContext.Provider>
        );
    }
}

const ProductConsumer = ProductContext.Consumer; // *********

export { ProductProvider, ProductConsumer }; // *********
