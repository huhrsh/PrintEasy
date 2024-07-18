import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch,useSelector } from "react-redux"
import {setUser,setShop, getApiUrl} from '../Redux'
import '../Styles/sign.css';

function SignIn(){
    const dispatch=useDispatch();
    const user=useSelector((state)=>state.user.user)
    const passInput=document.querySelector('.pass-div>input')
    const apiUrl=getApiUrl()

    function passVisibility(){
      if(passInput){
        if(passInput.type==='password'){
          passInput.type='text'
        }
        else{
          passInput.type='password'
        }
      }
    }


    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")

    const navigate=useNavigate();

    async function handleSubmit(e){
        e.preventDefault();
        let formData={email,password}

        let data;
        try {
            const response = await fetch(apiUrl+'/users/sign-in', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
              credentials:"include",
            });
            data=await response.json();
            // console.log("Response.text: ", data); 
          } catch (error) {
            console.error('Error submitting form:', error);
        }
        setEmail("");
        setPassword("");
        if(!data){
          toast.error("Invalid credentials");
        }
        else{
          if(data.shop || data.user){
            // console.log(data);
            if(data.shop){
              toast.success("Signed in")
              dispatch(setShop(data.shop));
            }
            else if(data.user){
              toast.success("Signed in")
              dispatch(setUser(data.user));
            }
            // const user=data.user;
            navigate('/');
          }
          else if(data==='Incorrect password'){
            toast.warn("Password does not match")
          }
        }
      }
    useEffect(()=>{
      // console.log(user)
      if(user){
        toast("You are already signed in",{
          progressStyle: { background: '#95befb'},
        })
        navigate('/')
      }
    },[])

    return (
        <>
            <main className="sign-in">
                <h2 className="sign-heading">Sign In</h2>
                <form method="post" onSubmit={(e)=>{handleSubmit(e)}} className="sign-form">
                    <input value={email} onChange={(e)=>{setEmail(e.target.value)}} className="sign-input" type="email" placeholder="email" autoFocus/>
                    <div className="pass-div">
                      <input onChange={(e)=>{setPassword(e.target.value)}} value={password} type="password" placeholder="password"/>
                      <img alt="show/hide password" onClick={()=>{passVisibility()}} className="password-eye" src="https://cdn-icons-png.flaticon.com/128/9458/9458496.png" />
                    </div>
                    <button type="submit">Sign In</button>
                </form>
                {/* <Link className="google">Sign In using Google</Link> */}
                <Link to= '/sign-up' className='redirect-sign'>Don't have an account? Sign up here</Link>
                {/* <Link to= '/business-sign-in' className='redirect-sign'>Sign in to your business account</Link> */}
            </main>
        </>
    )
}

export {SignIn}
