import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Backend_url from '../../Config'
import CardIndi from './CardIndi'
import { useNavigate } from 'react-router'
import { Modal } from "antd";
const Cart = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate()
    const [discountAmount, setDisCountAmount] = useState(0)
    const [mobile, setMobile] = useState("")
    const [address, setaddress] = useState("")
    const [showModalBuy, setShowModalBuy] = useState(false)

    const [nameonCard, setNameOnCard] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [zip, setZip] = useState("")

    const [buyItem, setBuuyItem] = useState({})
    const [security, setSecurity] = useState("")
    const [all_products, setAllProducts] = useState([])
    const [all_search_products, setAllSearchProducts] = useState([])
    const [productTrigger, setPTrigger] = useState(false)
    const [coupons, setCoupons] = useState([])
    useEffect(() => {

        axios.get(`${Backend_url}/cart/all`).then(res => {
            console.log(res.data)
            if (res.data.length === 0) {
                setAllProducts([])
                setAllSearchProducts([])
            }
            res.data.map(d => {
                if (d.email === JSON.parse(localStorage.getItem('user')).email) {
                    setAllProducts(res.data)
                    setAllSearchProducts(res.data)
                }
            })


        })
            .catch(err => {
                window.alert('error happen')
            })
    }, [productTrigger])

    useEffect(() => {
        axios.get(`${Backend_url}/coupons/all`).then(res => {
            setCoupons(res.data)


        })
            .catch(err => {
                window.alert('error happen')
            })
    }, [])







    const search = (e) => {

        setAllSearchProducts(all_products.filter(a => {
            return a.name.toLowerCase().includes(e.target.value.toLowerCase())
        }))
    }

    const removeItem = (id) => {
        axios.delete(`${Backend_url}/cart/delete/${id}`).then(res => {
            setPTrigger(!productTrigger)
        })
    }
    const checkoutHandle = (item) => {
        setBuuyItem(item)
        setDisCountAmount(item.newcost)
        setShowModal(true)

    }

    const disHandler = (e) => {
        setDisCountAmount(buyItem.newcost)
        coupons.map(c => {
            if (e.target.value === c.name) {

                const a = discountAmount - c.discount

                setDisCountAmount(a)


            }

        })

    }
    const [btnProps, setBtnProps] = useState(true)
    useEffect(() => {
        if (nameonCard !== "" && security !== "" && address !== '' && security.length === 3 && zip !== "" && zip.length === 6 && cardNumber !== "" && cardNumber.length === 13 && mobile.length === 10 && expiry !== '') {
            setBtnProps(false)

        }
        else {
            setBtnProps(true)
        }
    }, [address, cardNumber, expiry, mobile.length, nameonCard, security, zip])


    const removeFromCart = () => {
        axios.delete(`${Backend_url}/cart/delete/${buyItem.id}`).then(res => {
            setPTrigger(!productTrigger)
            setShowModal(false)
            setShowModalBuy(true)
        })
    }
    const [couponDiscount, setCouponDiscount] = useState(0)



    // CHANGES MADE HERE

    const paymentSubmit = () => {

        axios.post(`${Backend_url}/buy/add`, {
            ...buyItem, "newcost": discountAmount, "address": address,
            "mobile": mobile, "pincode": zip, "event_discount": parseInt(buyItem.newcost) - parseInt(discountAmount)
        }).then(res => {

            setPTrigger(!productTrigger)
            removeFromCart()
        })

        console.log(buyItem)
        setShowModal(false);
    }


    const [allBuyNames, setAllBuyNames] = useState([])
    const [allCost, setAllCost] = useState(0)
    const [showModal2, setShowModal2] = useState(false);



    const BuyAll = () => {
        setDisCountAmount(0)
        all_products.map(p => {
            setAllCost(prev => prev + p.newcost)
            setDisCountAmount(prev => prev + p.newcost)
        })
        setShowModal2(true)
    }


    const disHandler2 = (e) => {
        setDisCountAmount(allCost)
        coupons.map(c => {
            if (e.target.value === c.name) {

                const a = discountAmount - c.discount

                setDisCountAmount(a)
                setCouponDiscount(c.discount)
            }

        })

    }

    const removeFromAllCart = (id, index) => {

        axios.delete(`${Backend_url}/cart/delete/${id}`).then(res => {

            if (+index + 1 == all_products.length) {
                window.alert("All item buyed successfully")
                setShowModal2(false);
                setPTrigger(!productTrigger)
                setShowModal2(false)
                setShowModalBuy(true)

            }


        })


    }

    const paymentSubmit2 = async () => {
        // setShowModal2(false);
        all_products.map((a, index) => {
            axios.post(`${Backend_url}/buy/add`, {
                ...all_products[index], "pincode": zip, "address": address,
                "mobile": mobile, "newcost": parseInt(all_products[index].newcost) - parseInt(couponDiscount / all_products.length), "event_discount": couponDiscount
            }).then(res => {

                removeFromAllCart(a.id, index)
            })



        })
    }

    return (
        <>

            <Modal
                title={` `}
                centered
                visible={showModalBuy}
                onOk={() => {
                    navigate('/profile')

                }}
                onCancel={() => {
                    setShowModalBuy(false);
                    setPTrigger(!productTrigger)
                    setNameOnCard('')
                    setMobile('')
                    setaddress('')
                    setExpiry('')
                    setZip('')
                    setSecurity('')
                    setCardNumber('')


                }}

                okButtonProps={{ color: "green" }}
                okText="Go to order"
                cancelText="Close"
            >

                <div>
                    <div style={{ fontSize: "40px", color: "green", textAlign: "center" }}> <i class="fa-solid fa-circle-check"></i></div>
                    <div style={{ fontSize: "26px", color: "green", textAlign: "center" }}>Payment for  {buyItem.name} is Successful</div>
                </div>

            </Modal>




            <Modal
                title={`Payment for  ${buyItem.name} (${buyItem.count} items) `}
                centered
                visible={showModal}
                onOk={() => {
                    paymentSubmit()

                }}
                onCancel={() => {
                    setShowModal(false);
                    setShowModal(false);
                    setShowModal(false);
                    setNameOnCard('')
                    setMobile('')
                    setaddress('')
                    setExpiry('')
                    setZip('')
                    setSecurity('')
                    setCardNumber('')

                }}

                okButtonProps={{ disabled: btnProps, color: "rgb(45, 45, 105)" }}
                okText="Buy"
                cancelText="Close"
            >
                <div style={{ fontSize: "17px", margin: "5px" }}>
                    Payment Amount
                    <div>&#8377;{+discountAmount}</div>
                </div>
                <div style={{ fontSize: "16px", margin: "5px" }}>
                    Name on card
                    <input type="text" value={nameonCard} onChange={e => {
                        if (isNaN(e.target.value)) {
                            setNameOnCard(e.target.value)
                            document.getElementById('error').textContent = ""
                        }
                        else {
                            document.getElementById('error').textContent = "Please enter string"
                            document.getElementById('expiry').value = ""
                            setExpiry("")
                            setExpiry("")

                            setNameOnCard("")
                        }
                    }
                    } className="disIn" placeholder='Name on card' />
                </div>
                <div style={{ fontSize: "16px", margin: "5px" }}>
                    Card Number
                    <input type="number" value={cardNumber} onChange={e => {
                        if (e.target.value >= 0) {
                            if (e.target.value.length <= 13) {
                                document.getElementById('error').textContent = "Please enter 13 digit card number"
                                setCardNumber(e.target.value)
                                document.getElementById('expiry').value = ""
                                setExpiry("")
                            }
                            else {

                                document.getElementById('error').textContent = ""

                            }

                        }
                        else {
                            document.getElementById('error').textContent = "Please enter 13 digit card number"


                        }
                    }} className="disIn" placeholder='Card Number' />
                </div>

                <div style={{ fontSize: "16px", margin: "5px", width: "100%" }}>
                    <label>Address</label>
                    <input type="text" value={address} onChange={e => {
                        if (e.target.value !== '') {
                            setaddress(e.target.value)
                            document.getElementById('error').textContent = ""
                        }
                        else {
                            document.getElementById('error').textContent = "Please enter string"
                            document.getElementById('expiry').value = ""
                            setExpiry("")

                            setaddress("")
                        }
                    }
                    } className="disIn" placeholder='Address' />
                </div>
                <div style={{ fontSize: "16px", margin: "5px", width: "100%" }}>
                    <label>Mobile Number</label>
                    <input type="number" value={mobile} onChange={e => {
                        if (e.target.value >= 0) {
                            if (e.target.value.length <= 10) {
                                document.getElementById('error').textContent = "Please enter 10 digit Mobile number"
                                document.getElementById('expiry').value = ""
                                setExpiry("")
                                setMobile(e.target.value)
                            }
                            else {

                                document.getElementById('error').textContent = ""
                            }

                        }
                        else {
                            document.getElementById('error').textContent = "Please enter 10 Mobile  number"


                        }
                    }} className="disIn" placeholder='Mobile Number' />
                </div>
                <div style={{ fontSize: "16px", margin: "5px", display: "flex", gap: "15px" }}>
                    <div>
                        Expiry
                        <input type="month" id="expiry" onChange={e => {


                            const date1 = new Date()
                            const date2 = new Date(e.target.value)
                            if (
                                date1.getFullYear() >= date2.getFullYear() &&
                                date1.getMonth() > date2.getMonth()
                            ) {
                                document.getElementById('error').textContent = "Card is expired"
                                setBtnProps(true)

                            } else {
                                document.getElementById('error').textContent = ""
                                setBtnProps(false)

                            }




                        }} className="disIn" placeholder="MM / YY" max="7" />                    </div>

<div style={{ fontSize: "16px", margin: "5px", width: "100%" }}>
                        <label style={{ display: "block" }}>Zip/PostalCode</label>
                        <input type="number" value={zip} onChange={e => {
                            if (e.target.value >= 0) {
                                if (e.target.value.length <= 6) {
                                    document.getElementById('error').textContent = "Please enter 6 digit Zip"
                                    document.getElementById('expiry').value=""
                                     setExpiry("")
                                    setZip(e.target.value)
                                }
                                else {

                                    document.getElementById('error').textContent = ""
                                }

                            }
                            else {
                                document.getElementById('error').textContent = "Please enter 6 digit Zip"
                                document.getElementById('expiry').value=""
                                 setExpiry("")


                            }
                        }} className="disIn" placeholder="Zip" />
                    </div>
                    <div>
                        Security Code
                        <input type="number" value={security} onChange={e => {
                            if (e.target.value >= 0) {
                                if (e.target.value.length <= 3) {
                                    document.getElementById('error').textContent = "Please enter 3 digit security number"
                                    setSecurity(e.target.value)
                                    document.getElementById('expiry').value = ""
                                    setExpiry("")
                                }
                                else {

                                    document.getElementById('error').textContent = ""

                                }

                            }
                            else {
                                document.getElementById('error').textContent = "Please enter 3 digit security number"
                                document.getElementById('expiry').value = ""
                                setExpiry("")


                            }
                        }} className="disIn" placeholder="security" />                    </div>
                </div>
                <div style={{ fontSize: "16px", margin: "5px" }}>
                    <input type="text" onChange={disHandler} className="disIn" placeholder='Add Coupon' />
                    <span id='error' style={{ color: "red" }}></span>                </div>


            </Modal>


            <Modal
                title={`Payment for  ${all_products.map(f => f.name)}  `}
                centered
                visible={showModal2}
                onOk={() => {
                    paymentSubmit2()

                }}
                onCancel={() => {
                    setShowModal2(false);
                    setShowModal(false);
                    setNameOnCard('')
                    setMobile('')
                    setaddress('')
                    setExpiry('')
                    setZip('')
                    setSecurity('')
                    setCardNumber('')

                }}
                okButtonProps={{ disabled: btnProps, color: "rgb(45, 45, 105)" }}
                okText="Buy"
                cancelText="Close"
            >
                <div style={{ fontSize: "17px", margin: "5px" }}>
                    Payment Amount
                    <div>&#8377;{+discountAmount}</div>
                </div>
                <div style={{ fontSize: "16px", margin: "5px" }}>
                    Name on card
                    <input type="text" value={nameonCard} onChange={e => {
                        if (isNaN(e.target.value)) {
                            setNameOnCard(e.target.value)
                            document.getElementById('error').textContent = ""
                        }
                        else {
                            document.getElementById('error').textContent = "Please enter string"
                            document.getElementById('expiry').value = ""
                            setExpiry("")
                            setExpiry("")

                            setNameOnCard("")
                        }
                    }
                    } className="disIn" placeholder='Name on card' />
                </div>
                <div style={{ fontSize: "16px", margin: "5px" }}>
                    Card Number
                    <input type="number" value={cardNumber} onChange={e => {
                        if (e.target.value >= 0) {
                            if (e.target.value.length <= 13) {
                                document.getElementById('error').textContent = "Please enter 13 digit card number"
                                setCardNumber(e.target.value)
                                document.getElementById('expiry').value = ""
                                setExpiry("")
                            }
                            else {

                                document.getElementById('error').textContent = ""

                            }

                        }
                        else {
                            document.getElementById('error').textContent = "Please enter 13 digit card number"


                        }
                    }} className="disIn" placeholder='Card Number' />
                </div>

                <div style={{ fontSize: "16px", margin: "5px", width: "100%" }}>
                    <label>Address</label>
                    <input type="text" value={address} onChange={e => {
                        if (e.target.value !== '') {
                            setaddress(e.target.value)
                            document.getElementById('error').textContent = ""
                        }
                        else {
                            document.getElementById('error').textContent = "Please enter string"
                            document.getElementById('expiry').value = ""
                            setExpiry("")

                            setaddress("")
                        }
                    }
                    } className="disIn" placeholder='Address' />
                </div>
                <div style={{ fontSize: "16px", margin: "5px", width: "100%" }}>
                    <label>Mobile Number</label>
                    <input type="number" value={mobile} onChange={e => {
                        if (e.target.value >= 0) {
                            if (e.target.value.length <= 10) {
                                document.getElementById('error').textContent = "Please enter 10 digit Mobile number"
                                document.getElementById('expiry').value = ""
                                setExpiry("")
                                setMobile(e.target.value)
                            }
                            else {

                                document.getElementById('error').textContent = ""
                            }

                        }
                        else {
                            document.getElementById('error').textContent = "Please enter 10 Mobile  number"


                        }
                    }} className="disIn" placeholder='Mobile Number' />
                </div>
                <div style={{ fontSize: "16px", margin: "5px", width: "100%" }}>
                    <label style={{ display: "block" }}>Zip/PostalCode</label>
                    <input type="number" value={zip} onChange={e => {
                        if (e.target.value >= 0) {
                            if (e.target.value.length <= 6) {
                                document.getElementById('error').textContent = "Please enter 6 digit Zip"
                                document.getElementById('expiry').value = ""
                                setExpiry("")
                                setZip(e.target.value)
                            }
                            else {

                                document.getElementById('error').textContent = ""
                            }

                        }
                        else {
                            document.getElementById('error').textContent = "Please enter 6 digit Zip"
                            document.getElementById('expiry').value = ""
                            setExpiry("")


                        }
                    }} className="disIn" placeholder="Zip" />
                </div>
                <div style={{ fontSize: "16px", margin: "5px", display: "flex", gap: "15px" }}>
                    <div>
                        Expiry
                        <input type="month" id="expiry" onChange={e => {


                            const date1 = new Date()
                            const date2 = new Date(e.target.value)
                            if (
                                date1.getFullYear() >= date2.getFullYear() &&
                                date1.getMonth() > date2.getMonth()
                            ) {
                                document.getElementById('error').textContent = "Card is expired"
                                setBtnProps(true)

                            } else {
                                document.getElementById('error').textContent = ""
                                setBtnProps(false)

                            }




                        }} className="disIn" placeholder="MM / YY" max="7" />                    </div>
                    <div>
                        Security Code
                        <input type="number" value={security} onChange={e => {
                            if (e.target.value >= 0) {
                                if (e.target.value.length <= 3) {
                                    document.getElementById('error').textContent = "Please enter 3 digit security number"
                                    setSecurity(e.target.value)
                                    document.getElementById('expiry').value = ""
                                    setExpiry("")
                                }
                                else {

                                    document.getElementById('error').textContent = ""

                                }

                            }
                            else {
                                document.getElementById('error').textContent = "Please enter 3 digit security number"
                                document.getElementById('expiry').value = ""
                                setExpiry("")


                            }
                        }} className="disIn" placeholder="security" />                    </div>
                </div>
                <div style={{ fontSize: "16px", margin: "5px" }}>
                    <input type="text" onChange={disHandler2} className="disIn" placeholder='Add Coupon' />
                    <span id='error' style={{ color: "red" }}></span>                </div>

            </Modal>


            <button style={{ background: "blue", color: "white", padding: "8px", cursor: "pointer", float: "right", margin: "10px" }}
                onClick={BuyAll}     >Buy All</button>

            <div style={{ display: "flex", alignItems: "center" }}>
                {/* <div>
                    <input type="text" onChange={search} style={{ padding: "10px", border: "2px solid gray", width: "400px", margin: "5px 20px", outline: "0" }} placeholder="search" />
                </div> */}


            </div>
            {all_products.length > 0 && <div style={{ margin: "auto", textAlign: "center", fontSize: "28px", marginTop: "20px" }}>Hey, <span style={{ textTransform: "capitalize" }}>{JSON.parse(localStorage.getItem('user')).name}</span> check Your Cart</div>}
            <div className='cardAll'>

                {all_products.length > 0 ?
                    <>

                        {all_search_products.map(item => (
                            <div><CardIndi item={item} />
                                <button style={{ background: "red", color: "white", padding: "8px", cursor: "pointer", float: "left" }}
                                    onClick={e => removeItem(item.id)}>Remove</button>
                                <button style={{ background: "blue", color: "white", padding: "8px", cursor: "pointer", float: "right" }}
                                    onClick={e => checkoutHandle(item)}>Checkout</button>
                            </div>

                        ))} </>
                    :
                    <div style={{ height: "72vh" }}><p>No Items are added in Cart</p></div>
                }

            </div>
        </>
    )
}

export default Cart
