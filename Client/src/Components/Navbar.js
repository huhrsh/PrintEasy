// import { Link, Outlet,useNavigate } from "react-router-dom"
// import {useSelector} from "react-redux";
// import { ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import { useDispatch } from 'react-redux';
// import { setUser,clearUser,setShop,clearShop } from "../Redux";
// import { useEffect, useState } from 'react';
// import { toast } from "react-toastify";
// import {PulseLoader} from "react-spinners";
// import printerImage from '../Assets/printer.png'
// import bgv from '../Assets/bg.mp4'

// function Navbar(){

//     const [loading,setLoading]=useState(true);
//     const navigate=useNavigate();
//     const dispatch=useDispatch();   
//     let shop; 
//     shop=useSelector((state)=>state.shop.shop);
//     let user; 
//     user=useSelector((state)=>state.user.user);
//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//               const response = await fetch('http://localhost:5000/users/get-user-data',{
//                 method:'POST',
//                 headers: {
//                 'Content-Type': 'application/json',
//               },
//                 credentials:"include",
//                 // user:JSON.stringify(user)
//               });

//               const userData = await response.json();
//             if (userData) {
//                   if(userData.shopId){
//                       dispatch(clearUser())
//                   }
//                   else{
//                       console.log("The user is: ",userData)
//                       dispatch(setUser(userData));
//                   }
//             }

//             } catch (error) {
//                 setLoading(false);
//             }
//           };
//           fetchUserData();
//     },[]);


//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//               const response = await fetch('http://localhost:5000/shop/get-shop-data',{
//                 method:'POST',
//                 headers: {
//                 'Content-Type': 'application/json',
//               },
//                 credentials:"include",
//                 // user:JSON.stringify(user)
//               });
//               const shopData = await response.json();
//               if (shopData) {
//                 console.log("The shop is: ",shopData)
//                 dispatch(setShop(shopData));
//             }

//             setLoading(false);
//             } catch (error) {
//                 setLoading(false);
//             }
//           };
//           fetchUserData();
//     },[]);

//     let SignOut;
//     useEffect(()=>{
//         SignOut= async function(){
//             const response=await fetch('http://localhost:5000/users/sign-out',{
//                 method:'POST',
//                 headers:{
//                     'Content-Type':'application/json'
//                 },
//                 credentials:'include'
//             })
//             toast.success("Signed out");
//             dispatch(clearUser())
//             navigate('/')
//         }
//     })

//     // console.log(user)

//     return(
//         loading===true?<PulseLoader color="#333" className="loader"/>:
//         <>
//             <header className="navbar">
//                 <Link to='/' className="printeasy-heading">
//                     {/* <img className="printeasy-img" alt="logo" src="https://cdn-icons-png.flaticon.com/128/2248/2248661.png"/> */}
//                     <img className="printeasy-img" alt="logo" src={printerImage}/>
//                     PrintEasy
//                 </Link>
//                 {user===null & shop===null?
//                 <Link to='/sign-in' className="user">
//                     <img src="https://cdn-icons-png.flaticon.com/128/456/456212.png" alt="user"/> Sign In
//                 </Link>:<></>}
//                 {user &&
//                     <div className="signed-user-nav">
//                         <Link to='/orders' className="order">
//                             {/* <img src="https://cdn-icons-png.flaticon.com/128/2900/2900294.png" alt="orders"/> */}
//                             My Orders
//                         </Link>
//                         <button onClick={()=>{SignOut()}} className="user">
//                             {/* <img src="https://cdn-icons-png.flaticon.com/128/456/456212.png" alt="user"/>  */}
//                             {/* {user.name} */}
//                             Sign Out
//                         </button>
//                     </div>
//                 }
//                 {shop &&
//                     <div className="signed-user-nav">
//                         <Link to='/orders' className="order">
//                             {/* <img src="https://cdn-icons-png.flaticon.com/128/2900/2900294.png" alt="orders"/> */}
//                             My Orders
//                         </Link>
//                         <button onClick={()=>{SignOut()}} className="user">
//                             {/* <img src="https://cdn-icons-png.flaticon.com/128/456/456212.png" alt="user"/>  */}
//                             {/* {user.name} */}
//                             Sign Out
//                         </button>
//                     </div>
//                 }
//             </header>
//             <ToastContainer 
//                 autoClose={3000}
//             />
//             {/* <video className="bg-video" loop muted autoPlay>
//                 <source src={bgv}/>
//             </video> */}
//             <Outlet/>
//         </>
    
//     )
// }

// export {Navbar}


import { Link, Outlet,useNavigate } from "react-router-dom"
import {useSelector} from "react-redux";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setUser,clearUser,setShop,clearShop } from "../Redux";
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import {PulseLoader} from "react-spinners";
import printerImage from '../Assets/printer.png'
import bgv from '../Assets/bg.mp4'
import { Shop } from "./Shop";

function Navbar(){

    const [loading,setLoading]=useState(true);
    const navigate=useNavigate();
    const dispatch=useDispatch();   
    let shop; 
    let user;

    shop=useSelector((state)=>state.shop.shop);
    user=useSelector((state)=>state.user.user);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
              const response = await fetch('https://print-easy.onrender.com/users/get-user-data',{
                method:'POST',
                headers: {
                'Content-Type': 'application/json',
                 },
                credentials:"include",
              });
              const userData = await response.json();
                if (userData) {
                    console.log(userData)
                  if(userData.shopId){
                      dispatch(setShop(userData))
                  }
                  else{
                      console.log("The user is: ",userData)
                      dispatch(setUser(userData));
                  }
            }
            setLoading(false);
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
          };
          if(!user && !shop){
            console.log("Fetching user")
              fetchUserData();
          }
    },[]);

    let SignOut;

    useEffect(()=>{
        SignOut= async function(){
            const response=await fetch('https://print-easy.onrender.com/users/sign-out',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                credentials:'include'
            })
            if(response.ok){
                toast.success("Signed out");
                dispatch(clearUser())
                dispatch(clearShop())
                navigate('/')
            }
            else{
                toast.error("Error signing out user.")
            }
        }
    })

    return(
        loading===true?<PulseLoader color="#333" className="loader"/>:
        <>
            <header className="navbar">
                <Link to='/' className="printeasy-heading">
                    {/* <img className="printeasy-img" alt="logo" src="https://cdn-icons-png.flaticon.com/128/2248/2248661.png"/> */}
                    <img className="printeasy-img" alt="logo" src={printerImage}/>
                    PrintEasy
                </Link>
                {!user & !shop?
                <Link to='/sign-in' className="user">
                    <img src="https://cdn-icons-png.flaticon.com/128/456/456212.png" alt="user"/> Sign In
                </Link>:
                user?<>
                <div className="signed-user-nav">
                        <Link to='/orders' className="order">
                            My Orders
                        </Link>
                        <button onClick={()=>{SignOut()}} className="user">
                            Sign Out
                        </button>
                    </div>
                </>:<>
                <div className="signed-user-nav">
                        {/* <Link to='/orders' className="order">
                            My Orders
                        </Link> */}
                        <button onClick={()=>{SignOut()}} className="user">
                            Sign Out
                        </button>
                    </div>
                </>}
                {/* {user &&
                    <div className="signed-user-nav">
                        <Link to='/orders' className="order">
                            My Orders
                        </Link>
                        <button onClick={()=>{SignOut()}} className="user">
                            Sign Out
                        </button>
                    </div>
                } */}
                {/* {shop &&
                    <div className="signed-user-nav">
                        <Link to='/orders' className="order">
                            My Orders
                        </Link>
                        <button onClick={()=>{SignOut()}} className="user">
                            Sign Out
                        </button>
                    </div>
                } */}
            </header>
            {!shop?<Outlet/>:<></>}
            {shop && <Shop/>}
            {/* {!shop && <Outlet/>} */}
        </>
    
    )
}

export {Navbar}
