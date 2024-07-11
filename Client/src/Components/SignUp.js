import { useState,useEffect } from "react";
import { Link,useNavigate } from "react-router-dom"
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getApiUrl } from "../Redux";
import '../Styles/sign.css'


function SignUp(){
    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("")
    const user=useSelector((state)=>state.user.user)
    const passInput=document.querySelectorAll('.pass-div>input')
    const apiUrl=getApiUrl()

    function passVisibility(k){
      if(passInput[k]){
        if(passInput[k].type==='password'){
          passInput[k].type='text'
        }
        else{
          passInput[k].type='password'
        }
      }
    }

    const navigate=useNavigate();

    async function handleSubmit(e){
        e.preventDefault();
        let formData={name,email,password}
        let data;
        if(password!=confirmPassword){
          toast.warning("Passwords do not match");
          return;
        }
        // console.log(formData);
        try {
            const response = await fetch(apiUrl+'/users/sign-up', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });
        
            data = await response.text();
            console.log("Response.text: ",data); // handle the response from the server
          } catch (error) {
            console.error('Error submitting form:', error);
        }
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        // console.log(data==='Email already in use.');
        if(data==='Account created'){
          toast.success("Account created")
          navigate('/sign-in');
        }
        else if(data==='Email already in use'){
          toast.warn("Email already in use")
        }
        else{
          toast.error("Error in creating account");
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
            <main className="sign-up">
                <h2 className="sign-heading">Sign Up</h2>
                <form method="post" onSubmit={(e)=>{handleSubmit(e)}} className="sign-form">
                    <input onChange={(e)=>{setName(e.target.value)}} value={name} type="text" placeholder="name" autoFocus/>
                    <input onChange={(e)=>{setEmail(e.target.value)}} value={email} type="email" placeholder="email"/>
                    <div className="pass-div">
                      <input onChange={(e)=>{setPassword(e.target.value)}} value={password} type="password" placeholder="password"/>
                      <img alt="show/hide password" onClick={()=>{passVisibility(0)}} className="password-eye" src="https://cdn-icons-png.flaticon.com/128/9458/9458496.png" />
                    </div>
                    <div className="pass-div">
                      <input onChange={(e)=>{setConfirmPassword(e.target.value)}} value={confirmPassword} type="password" placeholder="confirm password"/>
                      <img alt="show/hide password" onClick={()=>{passVisibility(1)}} className="password-eye" src="https://cdn-icons-png.flaticon.com/128/9458/9458496.png" />
                    </div>
                    <button type="submit">Sign Up</button>
                </form>
                {/* <Link to='/' className="google">Sign up using google</Link> */}
                <Link to= '/sign-in' className='redirect-sign'>Already have an account? Sign in here</Link>
            </main>
        </>
    )
}

export {SignUp}
