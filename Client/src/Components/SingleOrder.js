 import { useEffect, useState } from "react"
 import {toast} from 'react-toastify'
 import { useNavigate } from "react-router-dom";
 import { useSelector } from "react-redux";
 import { PulseLoader } from "react-spinners";
//  import crossSign from "../Assets/remove.png"
 import crossSign from "../Assets/cross.png"

 function SingleOrder({user,order,cross,getPrintDetails,reRender, setReRender}){
    const navigate=useNavigate();
    const [loading,setLoading]=useState(false)
    // let user=useSelector((state)=>state.user.user);
    
    useEffect(()=>{
        if(reRender){
            getPrintDetails(order._id)
            setReRender(false)
        }
    },[reRender])

    if(!user){
        toast("Unauthorized Access",{
            progressStyle:{ background: '#95befb'}
        })
        navigate('/')
    }

    useEffect(()=>{
        getPrintDetails(order._id)
        console.log("Shit")
    },[])

    useEffect(() => {
        const intervalId = setInterval(() => {
            getPrintDetails(order._id);
        }, 30000);
        return () => clearInterval(intervalId);
    }, [order._id, getPrintDetails]);

    return(
        loading?<PulseLoader color="#333" className="loader"/>:
        <>
        {/* {console.log(order)} */}
            { order && order.active?<main className="single-order-main">
            <img className="cross-button" onClick={()=>{cross()}} src={crossSign}/> 
            {!order.priority?<>
                <div>
                    Your order number is: {order.tokenNumber}
                </div>
                <div>
                    The shop is currently processing order number : {order.shop.currentToken}
                </div>
                <div>
                    You will be notified once your order is ready
                </div>
                <div className="order-shop-details">

                </div>            
            </>:<>
            Eww
            </>
            }
            Page keeps refreshing every 30 seconds
            </main>:
            <>
                Passive
            </>
            }
        </>
    )
 }

 export {SingleOrder}