import { useSelector,useDispatch } from "react-redux"
import { useNavigate,Link } from "react-router-dom"
import { toast } from "react-toastify"
import { useState,useEffect } from "react"
import { setUser,clearUser,setShop,clearShop } from "../Redux";
import { PulseLoader } from "react-spinners";
import { SingleOrder } from "./SingleOrder";

let socket;

function Orders(){

    let user=useSelector((state)=>state.user.user)
    let navigate=useNavigate()
    let dispatch=useDispatch()
    const[loading,setLoading]=useState(false);
    const [orderSelected, setOrderSelected]=useState();
    const [reRender,setReRender]=useState(false)

    useEffect(() => {
        if (user && user._id) {
          socket = new WebSocket(`ws://localhost:5000/user/${user._id}`);
    
          socket.addEventListener("open", (event) => {
            console.log("WebSocket connection opened for user:", user._id);
          });
    
          socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);
    
            if (message.type === "complete") {
              const { print } = message;
              if(print.priority){
                  toast(`Your priority order is ready`, {
                      progressStyle: { background: "#95befb" },
                  });
                }
                else{
                  toast(`Your order number ${print.tokenNumber} is ready`, {
                      progressStyle: { background: "#95befb" },
                  });
                
              }
              console.log("Bro whattt");
              setReRender(true);
              fetchUserData(user._id);
            }
            // return () => {
            //   socket.close();
            // };
          });
    }},[])
    

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:5000/users/get-user-data',{
            method:'POST',
            headers: {
            'Content-Type': 'application/json',
                },
            credentials:"include",
            });
            const userData = await response.json();
            if (userData) {
                dispatch(setUser(userData));
            }
        setLoading(false);
        } catch (error) {
            console.log(error)
            setLoading(false);
        }
    };    

    async function getPrintDetails(id){
        const respose=await fetch('http://localhost:5000/print/get-print-info',{
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json'
            },
            body:JSON.stringify({id})
        })
        console.log("Dalle")
        let data = await respose.json()
        console.log(data)
        if(data.message){
            toast.error(data.message);
            return;
        }
        setOrderSelected(data);
        setLoading(false)
        return;
    }

    useEffect(() => {
        let params = new URLSearchParams(window.location.search);
        let orderId = params.get("id");
        fetchUserData()
        if(orderId){
            getPrintDetails(orderId);
        }
        else{
            setLoading(false);
        }
    },[]);

    if(!user){
        toast('Unauthorized access')
        navigate('/')
    }
    
    function cross(){
        console.log("Cross function called");
        setOrderSelected(undefined)
        navigate('/orders')
    }

    function getISTTime(utcTimestamp) {
        const date = new Date(utcTimestamp);
        date.setUTCHours(date.getUTCHours() ); 
        date.setUTCMinutes(date.getUTCMinutes() ); 
        
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; 
      
        const formattedTime = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
      
        return formattedTime;
      }

    return (
        loading===true?<PulseLoader color="#333" className="loader"/>:
        <>
        {/* {console.log(orderSelected)} */}
        {orderSelected &&
            <div className="order-selected">
                <SingleOrder user={user} order={orderSelected} cross={cross} getPrintDetails={getPrintDetails} reRender={reRender} setReRender={setReRender}/>
            </div>
            }
        <main className="order-main">
            <section className="active-orders-section">
                <h2 className="send-heading">
                    Active orders 
                </h2>
                {user.activePrints.length==0?<p className="no-prints">No active orders</p>:
                <div className="order-list">
                    <div className="individual-order individual-order-heading">
                        <h3 className="individual-order-div">Order number</h3>
                        <h3 className="individual-order-div">Files sent</h3>
                        {/* <h3 className="individual-order-div">Priority print</h3> */}
                        <h3 className="individual-order-div">Ordered at</h3>
                        <h3 className="individual-order-div">Amount paid</h3>
                    </div>
                    {user.activePrints.slice().reverse().map((item,index)=>{
                        // {console.log(item)}
                        return(
                            <div onClick={()=>{setOrderSelected(item)}} key={index} className="individual-order">
                                <div className="individual-order-div">
                                    <p>{item.tokenNumber===-1?"None(priority order)":item.tokenNumber}</p>
                                </div>
                                <div className="individual-order-div">
                                    <p>{item.files.length}</p>
                                </div>
                                {/* <div className="individual-order-div">
                                    <p>{item.priority?"Yes":"No"}</p>
                                </div> */}
                                <div className="individual-order-div">
                                    <p>{getISTTime(item.createdAt)} &nbsp; {item.createdAt.split('T')[0].split('-').reverse().join('-')}</p>

                                </div>
                                <div className="individual-order-div">
                                    <p>₹{item.totalPrice}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                }
            </section>

            <section className="previous-orders-section">
                <h2 className="send-heading">
                    Previous orders
                </h2>
                {user.filePrinted.length==0?<p className="no-prints">No active orders</p>:
                <div className="order-list">
                    <div className="individual-order individual-order-heading">
                        <h3 className="previous-order-div">Order number</h3>
                        <h3 className="previous-order-div">Files sent</h3>
                        {/* <h3 className="previous-order-div">Priority print</h3> */}
                        <h3 className="previous-order-div individual-date">Ordered at</h3>
                        <h3 className="previous-order-div individual-date">Received at</h3>
                        <h3 className="previous-order-div">Amount paid</h3>
                    </div>
                    {user.filePrinted.slice().reverse().map((item,index)=>{
                        return(
                            <div onClick={()=>{setOrderSelected(item)}} key={index} className="individual-order">
                                <div className="previous-order-div">
                                    <p>{item.tokenNumber===-1?"None (priority order)":item.tokenNumber}</p>
                                </div>
                                <div className="previous-order-div">
                                    <p>{item.files.length}</p>
                                </div>
                                {/* <div className="previous-order-div">
                                    <p>{item.priority?"Yes":"No"}</p>
                                </div> */}
                                <div className="previous-order-div individual-date">
                                    <p>{getISTTime(item.createdAt)} &nbsp; {item.createdAt.split('T')[0].split('-').reverse().join('-')}</p>
                                </div>
                                <div className="previous-order-div individual-date">
                                    <p>{getISTTime(item.updatedAt)} &nbsp; {item.updatedAt.split('T')[0].split('-').reverse().join('-')}</p>
                                </div>
                                <div className="previous-order-div ">
                                    <p>₹{item.totalPrice}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                }
            </section>
        </main>
        </>
    )
}

export {Orders}