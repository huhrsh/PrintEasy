import { useState,useEffect } from "react"
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getApiUrl } from "../Redux";
import '../Styles/receiveFile.css'


function ReceiveFile(){
    const [token,setToken]=useState(null)
    const [files,setFiles]=useState();
    const user=useSelector((state)=>state.user.user)
    const apiUrl=getApiUrl()

    useEffect(()=>{
        const extractedToken = window.location.href.split('token=')[1];
        if (extractedToken) {
            setToken(extractedToken)
        }
    },[])

    useEffect(()=>{
        const extractedToken = window.location.href.split('token=')[1];
        if(token===extractedToken){
            submitReceive()
        }
    },[token])

    async function submitReceive(e){
        if(e){
            e.preventDefault();
        }
        // console.log(token)
        const response = await fetch(apiUrl+'/file/receive/',{
            method:'POST',
            // credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body:user?JSON.stringify({ token,user:user._id }):JSON.stringify({ token})
        })

    const responseData=await response.json();
        if(responseData.text==="Files fetched"){
            toast.success(responseData.text);
            setFiles(responseData.files.files)
            // console.log(responseData)
        }
        else if(responseData.text.startsWith("Incorrect")){
            toast.warn(responseData.text)
        }
        // else if(responseData.text==="Error in uploading"){
        //     toast.error(responseData.text);
        // }
        else{
            toast.error(responseData.text)
        }
    }

    async function downloadFiles(){
        const response=await fetch(apiUrl+'/file/download/',{
            method:'POST',
            // credentials:'include',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({files})
        })
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        // link.download = `download.zip`;
        link.download = `${token}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }
    
    return(
        <>
            <main className="receive-main">
                <form className="receive-form">
                    Please enter your token: 
                    <input required onChange={(e)=>{setToken(e.target.value)}} value={token} type="text" />
                    <button onClick={(e)=>submitReceive(e)}>Retreive</button>
                </form>
                <br/>
                {files && <>
                <div className="heading-download-section">
                    <p className="send-heading">Retreived files: </p>
                    <button onClick={()=>{downloadFiles()}}><img className="download-image" src="https://cdn-icons-png.flaticon.com/128/3031/3031707.png" alt="download"/> Download</button>
                </div>
                    <ul className="preview-section">
                        <br/>
                    {
                        Object.values(files).map((file,index)=>(
                            <li className="preview-name" key={index}>
                                {file.original_filename.split('.')[0]}
                            </li>
                        ))
                    }
                    </ul>
                </>
                }

            </main>
        </>
    )
}

export {ReceiveFile}
