import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector,useDispatch } from "react-redux";
import { ShopOrder } from "./ShopOrder";
import { getApiUrl, setShop } from "../Redux";
import '../Styles/shop.css'

// const socket = new WebSocket("ws://localhost:5000");
let socket;

function Shop() {
  const dispatch=useDispatch()
  let shop=useSelector((state)=>state.shop.shop);
  // console.log(shop);
  const [selectedShop, setSelectedShop] = useState(shop);
  const [order,setOrder]=useState()
  const [totalOrders,setTotalOrders]=useState(false)
  const apiUrl=getApiUrl()
  const websocketUrl=getApiUrl()

  useEffect(() => {
    if (shop && shop._id ) {
      socket = new WebSocket(`${websocketUrl}/shop/${shop._id}`);
      socket.addEventListener("error", (error)=>{
        console.log("Error in opening socket", error)
      })
      socket.addEventListener("open", (event) => {
        // console.log("WebSocket connection opened for shop:", shop._id);
      });


      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "newPrint") {
          const { shopId, printId, priority } = message;
          console.log(
            `New print received for shop ${shopId}. Print ID: ${printId}, priority: ${priority}`
          );
          if (priority) {
            toast("New priority order received", {
              progressStyle: { background: "#95befb" },
            });
          } else {
            toast("New order received", {
              progressStyle: { background: "#95befb" },
            });
          }
          fetchShopDetails(shopId);
        }
        return () => {
          socket.close();
        };
      });
    }},[shop, websocketUrl])

    useEffect(()=>{
      fetchShopDetails(shop._id);
    },[order])

  async function fetchShopDetails(shopId) {
    try {
      const response = await fetch(apiUrl+"/shop/fetch-shop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopId: shopId }),
      });
      if (!response.ok) {
        console.error("Error in searching shops:", response.statusText);
        toast("Error in searching shops");
        return;
      }
      const data = await response.json();
      setSelectedShop(data.shop);
      dispatch(setShop(data.shop))
    } catch (error) {
      console.error("Error during shop search:", error);
    }
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

  async function changeShopStatus(){
    const response=await fetch(apiUrl+'/shop/change-status',{
      method:'POST',
      headers:{
        'Content-Type' : 'application/json'
      },
      body:JSON.stringify({id:shop._id})
    })
    if(response.ok){
      // toast.success("Shop status changed.")
    }
    else{
      toast.error("Error in changing shop status")
    }
  }

  const [colorPrint,setColorPrint]=useState(shop.colorPrints)
  const [bnwPrints,setbnwPrints]=useState(shop.blackPrints)

  async function setPrintStatus(object){
    object.id=shop._id;
    const response=await fetch(apiUrl+"/shop/change-print-status",{
    method:"POST",
    headers:{
      "Content-Type":"Application/Json"
    },
    body: JSON.stringify(object)
    })
    if(response.ok){
      console.log("Line 1");//
      fetchShopDetails(shop._id)
    }
    else{
      toast.error("Error in changing status")
    }
  }

  return (
    <>
    <form className="shop-options-div">
      <div className="print-available-main">
        <div className="print-available">
          Colored prints status: &nbsp;<div onClick={()=>{setPrintStatus({"colorPrints":shop.colorPrints,type:"color"})}} className="print-available-outer"><div className={`print-available-inner ${shop.colorPrints?"print-is-available":"print-unavailable"}`}></div></div> &nbsp; ({shop.colorPrints?"available":"unavailable"})
        </div>
        <div className="print-available">
          Black and white prints status:  &nbsp;<div onClick={()=>{setPrintStatus({"blackPrints":shop.blackPrints,type:"black"})}}  className="print-available-outer"><div className={`print-available-inner ${shop.blackPrints?"print-is-available":"print-unavailable"}`}></div></div> &nbsp; ({shop.blackPrints?"available":"unavailable"})
        </div>
      </div>
      {
        shop.on?
        <button onClick={changeShopStatus} className="start-stop-order stop-order">Stop taking orders</button>
        :
        <button onClick={changeShopStatus} className="start-stop-order">Start taking orders</button>
      }
    </form>
    {order &&
    <section className="order-selected">
      <ShopOrder order={order} setOrder={setOrder}/>
    </section>}
        <main className="shop-main">
          <section className="priority-orders">
            <h2 className="send-heading">Priority Orders</h2>
            <div className="shop-orders-sub">
              <div className="individual-order individual-order-heading">
                        {/* <h3 className="individual-order-div">Order number</h3> */}
                        {/* <h3 className="individual-order-div">Customer Name</h3> */}
                        <h3 className="individual-order-div">Number of files</h3>
                        {/* <h3 className="individual-order-div">Priority print</h3> */}
                        <h3 className="individual-order-div">Ordered at</h3>
                        <h3 className="individual-order-div">Amount paid</h3>
                </div>
              {selectedShop?.currentPriorityOrders?.length>0?selectedShop.currentPriorityOrders.map((order,index)=>(
                <div onClick={()=>{setOrder(order)}} className="individual-order shop-individual-order" key={index}>
                  <div className="individual-order-div">
                    <p>{order.files.length}</p>
                  </div>
                  <div className="individual-order-div individual-date">
                    <p> {getISTTime(order.createdAt)} {order.createdAt.split('T')[0]}</p>
                  </div>
                  <div className="individual-order-div">
                    <p>₹{order.totalPrice}</p>
                  </div>

                </div>
              )):<p className="max-sm:text-lg sm:text-base">No orders yet</p>}
              </div>
          </section>
          <section className="normal-orders">
          <h2 className="send-heading">Regular Orders</h2>
            <div className="shop-orders-sub">
              <div className="individual-order individual-order-heading">
                        <h3 className="individual-order-div">Order number</h3>
                        <h3 className="individual-order-div">Number of files</h3>
                        <h3 className="individual-order-div">Ordered at</h3>
                        <h3 className="individual-order-div">Amount paid</h3>
                </div>
              {selectedShop?.currentOrders?.length>0?selectedShop.currentOrders.map((order,index)=>(
                <div onClick={()=>{setOrder(order)}} className="individual-order shop-individual-order" key={index}>
                  <div className="individual-order-div">
                  <h4>Order number : </h4>
                    <p>{order.tokenNumber}</p>
                  </div>
                  <div className="individual-order-div">
                  <h4>Files sent : </h4>
                    <p>{order.files.length}</p>
                  </div>
                  <div className="individual-order-div individual-date">
                  <h4>Ordered at : </h4>
                    <p> {getISTTime(order.createdAt)} &nbsp; {order.createdAt.split('T')[0]}</p>
                  </div>
                  <div className="individual-order-div">
                  <h4>Amount paid : </h4>
                    <p>₹{order.totalPrice}</p>
                  </div>

                </div>
              )):<p className="max-sm:text-lg sm:text-base">No orders yet</p>}
              </div>
          </section>
        {totalOrders?
          <section className="normal-orders">
              <div className="show-total-orders" onClick={()=>{setTotalOrders(!totalOrders)}}>Don't show total orders</div>
          <h2 className="send-heading">Total Orders</h2>
            <div className="shop-orders-sub">
              <div className="individual-order individual-order-heading">
                        <h3 className="individual-order-div">Order number</h3>
                        <h3 className="individual-order-div">Number of files</h3>
                        <h3 className="individual-order-div">Ordered at</h3>
                        <h3 className="individual-order-div">Completed at</h3>
                        <h3 className="individual-order-div">Amount paid</h3>
                </div>
              {selectedShop.totalOrders?.length>0?selectedShop.totalOrders.slice().reverse().map((order,index)=>(
                <div onClick={()=>{setOrder(order)}} className="individual-order shop-individual-order" key={index}>
                  {/* {console.log(order)} */}
                  <div className="individual-order-div">
                  <h4>Order number : </h4>
                    <p>{order.tokenNumber}</p>
                  </div>
                  <div className="individual-order-div">
                  <h4>Files sent : </h4>
                  <p>{order.files.length}</p>
                  </div>
                  <div className="individual-order-div individual-date">
                  <h4>Ordered at : </h4>
                  <p> {getISTTime(order.createdAt)} {order.createdAt.split('T')[0]}</p>
                  </div>
                  <div className="individual-order-div individual-date">
                  <h4>Completed at : </h4>
                  <p> {getISTTime(order.updatedAt)} {order.updatedAt.split('T')[0]}</p>
                  </div>
                  <div className="individual-order-div">
                  <h4>Amount paid : </h4>
                  <p>₹{order.totalPrice}</p>
                  </div>

                </div>
              )):"No orders yet"}
              </div>
          </section>:
          <div className="show-total-orders" onClick={()=>{setTotalOrders(!totalOrders)}}>Show total orders</div>
        }
        </main>
  </>
  );
}

export { Shop };
