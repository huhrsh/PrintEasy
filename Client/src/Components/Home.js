// import { useEffect } from "react"
import {Link} from "react-router-dom"
import { useSelector } from "react-redux"

function Home(){

    const user=useSelector((state)=>state.user.user);
    const shop=useSelector((state)=>state.shop.shop);

    // console.log(shop);
    // console.log(user);

    return(
        <>
            <main className="home">
                {/* <div className="location-div">
                    <div className="shop-name-container"></div>
                </div> */}

                <div className="home-options">
                    <Link to='/send-file' className="send single-option">
                        {/* <img className="send-image" src='https://img.freepik.com/free-vector/mail-sent-concept-illustration_114360-96.jpg?size=626&ext=jpg&uid=R95045313&ga=GA1.1.1294546411.1698236110&semt=sph' alt="send" /> */}
                        <div className="inside-option">
                            <p>Send</p>
                        </div>
                    </Link>
                    <Link to='/print-file' className="print single-option">
                        {/* <img className="send-image" src='https://img.freepik.com/free-vector/mail-sent-concept-illustration_114360-96.jpg?size=626&ext=jpg&uid=R95045313&ga=GA1.1.1294546411.1698236110&semt=sph' alt="send" /> */}
                        <div className="inside-option">
                            <p>Print</p>
                        </div>
                    </Link>
                    <Link to='/receive-file' className="receive single-option">
                        {/* <img className="send-image" src='https://img.freepik.com/free-vector/mail-sent-concept-illustration_114360-96.jpg?size=626&ext=jpg&uid=R95045313&ga=GA1.1.1294546411.1698236110&semt=sph' alt="send" /> */}
                        <div className="inside-option">
                            <p>Receive</p>
                        </div>
                    </Link>
                </div>
            {!shop&!user ? <Link to= '/business-sign-up' className='redirect-sign business-sign'>Do you own a print shop? Join us by creating your business account</Link>:<></>}
            </main>
        </>
    )
}

export {Home}