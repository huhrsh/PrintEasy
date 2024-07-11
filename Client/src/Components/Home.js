// import { useEffect } from "react"
import {Link} from "react-router-dom"
import { useSelector } from "react-redux"
import '../Styles/home.css'

function Home(){

    const user=useSelector((state)=>state.user.user);
    const shop=useSelector((state)=>state.shop.shop);

    return(
        <>
            <main className="home">
                <div className="home-options2">
                    <Link to='/send-file' className="send single-option">
                        <div className="inside-option">
                            <p>Send</p>
                        </div>
                    </Link>
                    <Link to='/print-file' className="print single-option">
                        <div className="inside-option">
                            <p>Print</p>
                        </div>
                    </Link>
                    <Link to='/receive-file' className="receive single-option">
                        <div className="inside-option">
                            <p>Receive</p>
                        </div>
                    </Link>
                </div>
                <div className="home-options sm:hidden">
                    <Link to='/print-file' className="print single-option">
                        <div className="inside-option">
                            <p>Print</p>
                        </div>
                    </Link>
                    <div className="flex flex-row w-screen h-auto justify-center px-4 gap-4">
                    <Link to='/send-file' className="send single-option">
                        <div className="inside-option ">
                            <p>Send</p>
                        </div>
                    </Link>
                    <Link to='/receive-file' className="receive single-option">
                        <div className="inside-option">
                            <p>Receive</p>
                        </div>
                    </Link>
                    </div>
                </div>
            {!shop&!user ? <Link to= '/business-sign-up' className='redirect-sign business-sign'>Do you own a print shop? Join us by creating your business account</Link>:<></>}
            </main>
        </>
    )
}

export {Home}