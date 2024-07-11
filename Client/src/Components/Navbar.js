import { Link, Outlet,useNavigate } from "react-router-dom"
import {useSelector} from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setUser,clearUser,setShop,clearShop, getApiUrl } from "../Redux";
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import {PulseLoader} from "react-spinners";
import printerImage from '../Assets/printer.png'
import bgv from '../Assets/bg.mp4'
import { Shop } from "./Shop";
import '../Styles/navbar.css'

function Navbar(){

    const [loading,setLoading]=useState(true);
    const navigate=useNavigate();
    const dispatch=useDispatch();   
    let shop; 
    let user;
    const apiUrl=getApiUrl()

    shop=useSelector((state)=>state.shop.shop);
    user=useSelector((state)=>state.user.user);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
              const response = await fetch(apiUrl+'/users/get-user-data',{
                method:'POST',
                headers: {
                'Content-Type': 'application/json',
                 },
                credentials:"include",
              });
              const userData = await response.json();
                if (userData) {
                  if(userData.shopId){
                      dispatch(setShop(userData))
                  }
                  else{
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
            // console.log("Fetching user")
              fetchUserData();
          }
    },[]);

    let SignOut;

    // useEffect(()=>{
        SignOut= async function(){
            const response=await fetch(apiUrl+'/users/sign-out',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                credentials:'include'
            })
            if(response.ok){
                navigate('/')
                toast.success("Signed out");
                dispatch(clearUser())
                dispatch(clearShop())
            }
            else{
                toast.error("Error signing out user.")
            }
        }
    // })

    return(
        loading===true?<PulseLoader color="#333" className="loader"/>:
        <>
            <header className="navbar">
                <Link to='/' className="printeasy-heading">
                    {/* <img className="printeasy-img" alt="logo" src="https://cdn-icons-png.flaticon.com/128/2248/2248661.png"/> */}
                    {/* <img className="printeasy-img" alt="logo" src={printerImage}/> */}
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
                        <button onClick={()=>{SignOut()}} className="user">
                            Sign Out
                        </button>
                    </div>
                </>}
            </header>
            {!shop?<Outlet/>:<></>}
            {shop && <Shop/>}
        </>
    
    )
}

export {Navbar}
