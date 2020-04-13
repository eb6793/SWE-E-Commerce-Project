import React, { Component } from 'react'
// Everything below is for testing product info
import {Link} from 'react-router-dom';
import Title from './Title';



// Initially About Page, modifying to test product info
export default class About extends Component {


    render() {
        return (
            <div className="container">
                <div className="mt-5">
                <Title name="About" title="Us" />
                <body>
                <p className="mx-auto text-center mt-5">Welcome to CatWeGetAlong! We sell a variety of cat themed merchandise for cat lovers alike. Our mission is to provide sustainable clothing and products that not only postively impact people, but our pets and planet as well. </p>
                <div className="text-center" >
                <img src="img/about.png" />
                </div>
                </body>  
                </div>
            
            </div>
        )
    }
}
