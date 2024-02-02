import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {Link} from 'react-router-dom'
import { useSelector } from "react-redux";
import ReactDOM from "react-dom";
import QRCode from "react-qr-code";

function SendFile() {
    // upload preview done 
    const [state,setState]=useState("upload")
    const [fileData,setFileData]=useState();
    const [uploadedFile, setUploadedFile]=useState()
    const [compressedId,setCompressedId]=useState()
    const user=useSelector((state)=>state.user.user)

    async function submitForm(){        
        const formData = new FormData();
        for (let i = 0; i < fileData.length; i++) {
            // console.log(fileData[i]);
            formData.append(`file`, fileData[i]);
        }
        if(user){
            formData.append('user',user._id);
        }
        // for (const [key, value] of formData.entries()) {
        //     console.log(key, value);
        //   }

        const response=await fetch('http://localhost:5000/file/send',{
            method:'POST',
            // credentials:'include',
            // headers: {
            //     // 'Content-Type': 'undefined',
            //     'Content-Type': 'multipart/form-data',
            //   },
            body:formData
        })
        
        const responseData=await response.json();
        toast.success(responseData.text);
        // console.log(responseData);
        setUploadedFile(responseData.file)
        // console.log(response);
        // console.log(uploadedFile)
        setFileData([]);
        setState("done")
    }

    function handleDrop(e){
        e.preventDefault();
        console.log(e.dataTransfer.files);
        setFileData(e.dataTransfer.files);
        setState("preview");
    }

    function handleChoose(e){
        // console.log(e);
        const files=document.getElementsByClassName('choose-file')[0];
        setFileData(files.files);
        console.log(files.files);
        setState("preview")
    }

    useEffect(()=>{
        // console.log("Hi");
        if(fileData){
            // console.log(fileData);
            const len=fileData.length;
            for(let i=0;i<len;i++){
                if(fileData[i].size>5e+7){
                    toast.warning("File size greater than 50MB")
                    setFileData()
                }
            }
        }
    },[fileData])

    useEffect(()=>{
        if(uploadedFile){
            const hexToBytes = hex => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            const binaryData = hexToBytes(uploadedFile._id);
            const base64String = btoa(String.fromCharCode(...binaryData));
            setCompressedId(base64String)
        }
    },[uploadedFile])

    function copyToken(token){
        navigator.clipboard.writeText(token);
        toast.success("Text copied",{
        autoClose: 2000
        })
    }

    return (
        <>
            {
            state==="upload"?<form className="send-form" encType="multipart/form-data">
                <p className="drop-p" >Drag and drop your files in the box</p>
                <div className="drop-area" onDrop={(e)=>{handleDrop(e)}} onDragOver={(e)=>{e.preventDefault()}}>
                    <div className="drop-cover">
                        {/* <img className="drop-plus" src="https://cdn-icons-png.flaticon.com/128/32/32563.png" alt="plus"/> */}
                    </div>
                </div>
                <div className="select-files">
                    <p className="drop-p">Or select files here </p>
                    <input type="file" multiple className="choose-file" onChange={(e)=>{handleChoose(e)}}/>   
                </div>
            </form>:<></>
            }
            {
                state==="preview"?
                <>
                    <main className="send-main">
                        <h2 className="send-heading">Selected Files: </h2>
                        <ul className="preview-section">
                            {Object.values(fileData).map((item,index)=>(
                                <li key={index} className="preview-name">{item.name.split('.')[0]}</li>
                                // <div className="item-preview-container" key={index}>
                                    // {/* {item.type==='application/pdf'&&<iframe src={`${URL.createObjectURL(item)}#page=1`} className="item-preview-image" title="PDF Viewer" />}
                                    // {item.type.startsWith('image/')&&<img className="item-preview-image" src={URL.createObjectURL(item)} alt="item"/>}
                                    // {(item.type!=='application/pdf' & item.type.startsWith('image')===false )&&<img className="item-preview-image-default" src='https://cdn-icons-png.flaticon.com/128/2541/2541988.png' alt="item"/>} */}
                                // </div>
                            ))}
                        </ul>
                        <div className="cancel-upload">
                            <button className="cancel-button" onClick={()=>{setState("upload")}}>Cancel</button>
                            <button className="upload-button" onClick={()=>{submitForm()}}>Upload</button>
                        </div>
                    </main>
                </>:<></>
            }
            {
                state==="done"?
                <>
                    <main className="send-main">
                        <div className="done-div">    
                            <h2 className="send-heading">Your file token is:</h2>
                            <div className="token-div">
                                {compressedId}
                                <img onClick={()=>{copyToken(compressedId)}}  className="copy-image" src="https://cdn-icons-png.flaticon.com/128/126/126498.png"/>
                            </div>
                        </div>
                        <div className="done-div">    
                            <h2 className="send-heading">Your file link is:</h2>
                            <div className="token-div">
                                <Link to={`/receive-file?token=${compressedId}`}>http://localhost:3000/receive?token={compressedId}</Link>
                                
                                <img onClick={()=>{copyToken(compressedId)}}  className="copy-image" src="https://cdn-icons-png.flaticon.com/128/126/126498.png"/>
                            </div>
                        </div>
                        <div className="done-div qr-div">
                            <h2 className="send-heading">Your file QR code is:</h2>
                            <QRCode className="qr" value={"http://localhost:3000/receive?token="+compressedId} />
                        </div>
                        <p className="caution-message">
                            <img src='https://cdn-icons-png.flaticon.com/128/1672/1672451.png' alt="error" />
                            Files will be deleted in an hour
                        </p>
                    </main>
                </>:<></>
            }
        </>
    )
}

export { SendFile }