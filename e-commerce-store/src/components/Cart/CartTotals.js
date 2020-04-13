import React from 'react'
import {Link} from 'react-router-dom';
import PayPalButton from './PayPalButton';
import ProductConsumer from '../../context';


export default function CartTotals({value, history}) {
    const{cartSubTotal,cartTax,cartTotal,clearCart,cartContents} = value;
    
    
    var items = [];
    var item = {name:"",description:"",quantity:"",price:"",currency:""}; 

    const updateCart = (cartContents) => {
        
        console.log("updatecart method");
        items.length = cartContents.length;
        for(var i = 0; i < cartContents.length; i++) {
            item = {name:"",description:"",quantity:"",price:""};
            item.name = cartContents[i].title;
            item.description = cartContents[i].info;
            item.quantity = cartContents[i].count;
            item.price = cartContents[i].price;
            item.currency = "USD";
            items[i] = item;
        };
    };

    return (
        updateCart(cartContents), 
        
            <React.Fragment>
                <div className="container">
                <div className="row">
                <div className="col-10 mt-2 ml-sm-5 ml-md-auto ml-lg-auto col-sm-8 text-capitalize text-right">
                <Link to="/">
                <button className="btn btn-outline-danger text-uppercase mb-3 px-5" type="button" onClick={()=>clearCart()}>clear cart</button>
                </Link>   
                <h6>
                <span className="text-muted">
                    Item Subtotal: ${cartSubTotal}
                </span>
                </h6> 
                <h6>
                <span className="text-muted">
                    Estimated Sales Tax: ${cartTax}
                </span>
                
                </h6> 
                <h3>
                <span className="text-black">
                    total:
                </span>
                <strong> ${cartTotal}</strong>
                </h3> 
                <PayPalButton total={cartTotal} clearCart={clearCart} history={history} cartSubTotal={cartSubTotal} cartTax={cartTax} itemList={items}/>
                </div>
                </div>    
                </div>
            </React.Fragment>
    );
}
