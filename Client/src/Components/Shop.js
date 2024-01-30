import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {Link} from 'react-router-dom'
import { ShopOrder } from "./ShopOrder";

// const socket = new WebSocket("ws://localhost:5000");
let socket;

function Shop() {
  let shop=useSelector((state)=>state.shop.shop);
  console.log(shop);
  const [selectedShop, setSelectedShop] = useState(shop);
  const [order,setOrder]=useState()

  useEffect(() => {
    if (shop && shop._id) {
      socket = new WebSocket(`ws://localhost:5000/shop/${shop._id}`);

      socket.addEventListener("open", (event) => {
        console.log("WebSocket connection opened for shop:", shop._id);
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
        // return () => {
        //   socket.close();
        // };
      });
    }},[])

    useEffect(()=>{
      fetchShopDetails(shop._id);
    },[order])

    // socket.addEventListener("open", (event) => {
    //   console.log("WebSocket connection opened");
    // });

    // socket.addEventListener("message", (event) => {
    //   const message = JSON.parse(event.data);

    //   if (message.type === "newPrint") {
    //     const { shopId, printId, priority } = message;
    //     console.log(
    //       `New print received for shop ${shopId}. Print ID: ${printId}, priority: ${priority}`
    //     );
    //     if (priority) {
    //       toast("New priority order received", {
    //         progressStyle: { background: "#95befb" },
    //       });
    //     } else {
    //       toast("New order received", {
    //         progressStyle: { background: "#95befb" },
    //       });
    //     }
    //     fetchShopDetails(shopId);
    //   }
    // });

    // return () => {
    //   socket.close();
    // };
  // }, []); 

  async function fetchShopDetails(shopId) {
    try {
      console.log(shopId);
      const response = await fetch("http://localhost:5000/shop/fetch-shop", {
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


  return (
    <>
    {order?
    <section className="order-selected">
      <ShopOrder order={order} setOrder={setOrder}/>
    </section>
    :
        <main className="shop-main">
          <section className="priority-orders">
            <h2 className="send-heading">Priority Orders</h2>
            <div className="shop-orders-sub">
            {selectedShop.currentPriorityOrders.length?selectedShop.currentPriorityOrders.map((order,index)=>(
              <div onClick={()=>{setOrder(order)}} className="individual-orders" key={index}>
                {console.log(order)}
                <p>{order._id}</p>
                {order.createdAt.split('T')[0]}
                {order.tokenNumber}
              </div>
            )):"No priority orders"}
            </div>
          </section>
          <section className="normal-orders">
          <h2 className="send-heading">Regular Orders</h2>
            <div className="shop-orders-sub">
              <div className="individual-order individual-order-heading">
                        <h3 className="individual-order-div">Order number</h3>
                        <h3 className="individual-order-div">Number of files</h3>
                        {/* <h3 className="individual-order-div">Priority print</h3> */}
                        <h3 className="individual-order-div">Ordered at</h3>
                        <h3 className="individual-order-div">Amount paid</h3>
                </div>
              {selectedShop.currentOrders?selectedShop.currentOrders.map((order,index)=>(
                <div onClick={()=>{setOrder(order)}} className="individual-order shop-individual-order" key={index}>
                  {console.log(order)}
                  <div className="individual-order-div">
                    <p>{order.tokenNumber}</p>
                  </div>
                  <div className="individual-order-div">
                    <p>{order.files.length}</p>
                  </div>
                  <div className="individual-order-div individual-date">
                    <p> {getISTTime(order.createdAt)} {order.createdAt.split('T')[0]}</p>
                  </div>
                  <div className="individual-order-div">
                    <p>{order.totalPrice}</p>
                  </div>

                </div>
              )):"No orders yet"}
              </div>
          </section>
        </main>

    }
  </>
  );
}

export { Shop };
