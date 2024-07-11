import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { useState} from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {getApiUrl, setShop} from '../Redux'

function BusinessSignIn(){
    const apiUrl=getApiUrl()
    const dispatch=useDispatch();
    const passInput=document.querySelector('.pass-div>input')
    function passVisibility(){
      if(passInput.type==='password'){
        passInput.type='text'
      }
      else{
        passInput.type='password'
      }
    }
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const navigate=useNavigate();
    async function handleSubmit(e){
        e.preventDefault();
        let formData={email,password}
        let data;
        // console.log(formData);
        try {
            const response = await fetch(apiUrl+'/shop/sign-in', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
              credentials:"include",
            });
            data=await response.json();
            console.log("Response.text: ", data); // handle the response from the server
          } catch (error) {
            console.error('Error submitting form:', error);
        }
        // setEmail("");
        // setPassword("");
        if(data){
          console.log(data);
          dispatch(setShop(data.shop));
          toast.success("Signed in")
          // const user=data.user;
          navigate(-1);
        }
        else if(data==='Incorrect password'){
          toast.warn("Password does not match")
        }
        else{
          console.log(data)
          toast.error("Invalid credentials");
        }
      } 

    return (
        <>
            <main className="sign-in">
                <h2 className="sign-heading">Sign In | Business Account</h2>
                <form method="post" onSubmit={(e)=>{handleSubmit(e)}} className="sign-form">
                    <input value={email} onChange={(e)=>{setEmail(e.target.value)}} className="sign-input" type="email" placeholder="email" autoFocus/>
                    <div className="pass-div">
                      <input onChange={(e)=>{setPassword(e.target.value)}} value={password} type="password" placeholder="password"/>
                      <img onClick={()=>{passVisibility()}} alt="show/hide password" className="password-eye" src="https://cdn-icons-png.flaticon.com/128/9458/9458496.png" />
                    </div>
                    <button type="submit">Sign In</button>
                </form>
                {/* <Link className="google">Sign In using Google</Link>
                <Link to= '/sign-up' className='redirect-sign'>Don't have an account? Sign up here</Link>
                <Link to= '/business-sign-in' className='redirect-sign'>Sign in </Link> */}
            </main>
        </>
    )
}

export {BusinessSignIn}
