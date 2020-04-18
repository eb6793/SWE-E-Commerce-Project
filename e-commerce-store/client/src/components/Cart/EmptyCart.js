import React from 'react'

export default function EmptyCart() {
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-10 mx-auto text-center text-black">
                    <h1 className="mb-5">It looks like your cart is empty...</h1>

                    <h5>Check out our product page</h5>
                </div>
            </div>
        </div>
    )
}
