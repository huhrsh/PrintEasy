import { useState,useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../Redux";
import '../Styles/sign.css'

function BusnessSignUp(){
    const [state,setState]=useState("personal")
    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("")
    const [addressl1,setAddressl1]=useState("");
    const [addressl2,setAddressl2]=useState("");
    const [addressl3,setAddressl3]=useState("");
    const [addressl4,setAddressl4]=useState("");
    const [phone,setPhone]=useState("")
    const [bnw,setBnw]=useState()
    const [color,setColor]=useState()
    const [landmark, setLandmark] =useState("")
    const [openTime,setOpenTime]=useState()
    const [closeTime,setCloseTime]=useState()

    const apiUrl=getApiUrl()
    
    const passInput=document.querySelectorAll('.pass-div>input')

    function passVisibility(k){
      if(passInput[k].type==='password'){
        passInput[k].type='text'
      }
      else{
        passInput[k].type='password'
      }
    }

    const navigate=useNavigate();

    async function handleSubmit(e){
        e.preventDefault();
        let formData={name,email,password,addressl1,addressl2,addressl3,addressl4,phone,bnw,color,landmark,openTime,closeTime}
        let data;
        if(password!=confirmPassword){
          toast.warning("Passwords do not match");
          return;
        }
        // console.log(formData);
        try {
            const response = await fetch(apiUrl+'/shop/sign-up', {
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
        // setName("");
        // setEmail("");
        // setPassword("");
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


    return(
        <>
        {
          state==='personal' &&
            <main className="sign-up">
                <h2 className="sign-heading">Sign Up | Business Account</h2>
                <form method="post" onSubmit={(e)=>{handleSubmit(e)}} className="sign-form">
                    <input required onChange={(e)=>{setName(e.target.value)}} value={name} type="text" placeholder="owner's name" autoFocus/>
                    <input required onChange={(e)=>{setEmail(e.target.value)}} value={email} type="email" placeholder="email"/>
                    <div className="pass-div">
                      <input required onChange={(e)=>{setPassword(e.target.value)}} value={password} type="password" placeholder="password"/>
                      <img onClick={()=>{passVisibility(0)}}  alt="show/hide password" className="password-eye" src="https://cdn-icons-png.flaticon.com/128/9458/9458496.png" />
                    </div>
                    <div className="pass-div">
                      <input required onChange={(e)=>{setConfirmPassword(e.target.value)}} value={confirmPassword} type="password" placeholder="confirm password"/>
                      <img onClick={()=>{passVisibility(1)}} alt="show/hide password"  className="password-eye" src="https://cdn-icons-png.flaticon.com/128/9458/9458496.png" />
                    </div>
                    <button onClick={()=>{setState('business')}}>Continue</button>
                </form>
            </main>
        }
        {
          state==='business' &&
            <main className="sign-up ">
                <h2 className="sign-heading">Sign Up | Business Account</h2>
                <form method="post" onSubmit={(e)=>{handleSubmit(e)}} className="business sign-form">
                    <input required onChange={(e)=>{setAddressl1(e.target.value)}} value={addressl1} type="text" placeholder="shop name" autoFocus/>
                    <input required onChange={(e)=>{setPhone(e.target.value)}} value={phone} type="text" placeholder="phone" />
                    <input required onChange={(e)=>{setAddressl2(e.target.value)}} value={addressl2} type="text" placeholder="shop address (locality)"/>
                    <input required onChange={(e)=>{setAddressl3(e.target.value)}} value={addressl3} type="text" placeholder="shop address (city)"/>
                    <input required onChange={(e)=>{setAddressl4(e.target.value)}} value={addressl4} type="text" placeholder="pincode"/>
                    <input required onChange={(e)=>{setLandmark(e.target.value)}} value={landmark} type="text" placeholder="landmark"/>
                    <input required onChange={(e)=>{setBnw(e.target.value)}} value={bnw} type="number" placeholder="cost of 1 black and white print (in ₹)"/>
                    <input required onChange={(e)=>{setColor(e.target.value)}} value={color} type="number" placeholder="cost of 1 colored print (in ₹)"/>
                    <div className="form-divs">
                      <label>shop opening time:</label>
                      <input required onChange={(e)=>{setOpenTime(e.target.value)}} value={openTime} type="time" placeholder="shop opening time"/>
                    </div>
                    <div className="form-divs">
                      <label>shop closing time:</label>
                      <input required onChange={(e)=>{setCloseTime(e.target.value)}} value={closeTime} type="time" placeholder="shop closing time"/>
                    </div>
                    <div className="buttons-div">
                    <button onClick={()=>{setState("personal")}}>Back</button>
                    <button className="create-account-button" type="submit">Create Account</button>
                    </div>
                </form>
            </main>
        }
        </>
    )

}

export {BusnessSignUp}
