import { useEffect, useState,useRef } from "react";
import { toast } from "react-toastify";
import {Link,useNavigate} from 'react-router-dom'
import { useSelector } from "react-redux";
import { Document, Page, pdfjs } from 'react-pdf';
import 'animate.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({index, pdfFile , fileData, setFileData,selectedShop,setTotalPrice }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    let temp=Object.values(fileData)
  
    const onDocumentLoadSuccess = ({ numPages }) => {
      temp[index].pages=numPages;
      temp[index].pageRange='All'
      temp[index].pageMethod='Single'
      temp[index].pageColor='Color'
      temp[index].note=""
      temp[index].numberOfCopies=1
      temp[index].price=numPages*selectedShop.color;
      setFileData(temp);
      setNumPages(numPages);
    };
  
    return (
      <div className="pdf-div">
        <Document className={temp[index].pageColor=='Color'?"pdf-doc" :"pdf-doc bnw-page" }
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page className='pdf-page'  height={370} renderTextLayer={false} pageNumber={pageNumber} devicePixelRatio={7} />
        </Document>
        <div className="document-pages">
          <div className="page-minus" onClick={()=>{pageNumber>1?setPageNumber(pageNumber-1):setPageNumber(pageNumber)}}><img src='https://cdn-icons-png.flaticon.com/128/56/56889.png'/></div>
          <p>
            {pageNumber} / {numPages}
          </p>
          <div className="page-plus" onClick={()=>{pageNumber<numPages?setPageNumber(pageNumber+1):setPageNumber(pageNumber)}}><img src='https://cdn-icons-png.flaticon.com/128/3524/3524388.png'/></div>
        </div>
      </div>
    );
  };

function PrintFile() {
    const user=useSelector((state)=>state.user.user);
    const navigator=useNavigate();
    const userCheckedRef = useRef(false);
    
    useEffect(() => {
        console.log(userCheckedRef);
        if (!userCheckedRef.current && !user) {
            toast("Please login to proceed",{
              progressStyle: { background: '#95befb'},
            });
            navigator('/sign-in');
            userCheckedRef.current = true;
        }
    }, [user, navigator]);
    
    const [state,setState]=useState("location")
    const [fileData,setFileData]=useState();
    const [uploadedFile, setUploadedFile]=useState()
    const [compressedId,setCompressedId]=useState()
    const [inputValue, setInputValue] = useState('');
    const [inputAnimation,setInputAnimation]=useState(true)
    const placeholders = ['Shop Name', 'Location', 'Shop ID'];
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [shopList,setShopList]=useState();
    const [totalPrice,setTotalPrice]=useState("Calculating...")
    const [selectedShop, setSelectedShop]=useState();
    const [priorityPrint,setPriorityPrint]=useState(false);
    const [userToken,setUserToken]=useState();
    let tempArr;
    let intervalId;

    async function submitForm(e){
      e.preventDefault();        
      let fileInfo=[];
        const formData = new FormData();
        for (let i = 0; i < fileData.length; i++) {
            console.log("ooooooooooo",fileData[i]);
            formData.append(`file`, fileData[i]);
            fileInfo.push({pages: fileData[i].pages, pageRange: fileData[i].pageRange, pageColor: fileData[i].pageColor, pageMethod: fileData[i].pageMethod, note: fileData[i].note, price: fileData[i].price*fileData[i].numberOfCopies,numberOfCopies:fileData[i].numberOfCopies})
          }
          formData.append('shop',selectedShop._id);
          formData.append('user',user._id)
          formData.append('priority',priorityPrint);
          formData.append('totalPrice',totalPrice);
          formData.append("fileInfo",JSON.stringify(fileInfo))
          console.log("Form Data is: ",formData)

        const response=await fetch('http://localhost:5000/print/new-print',{
            method:'POST',
            body:formData,
        })
        
        const responseData=await response.json();
        if(responseData.message){
          toast.error(responseData.message);
        }
        // console.log("Response is: ",responseData);
        toast.success(responseData.text);
        // setUserToken(responseData.tokenNumber);
        // setUploadedFile(responseData.file)
        console.log(responseData);
        // console.log(uploadedFile)
        setFileData([]);
        navigator(`/orders?id=${responseData.print}`)
        // setState("done")
    }

    function handleDrop(e) {
      e.preventDefault();
      const droppedFiles = e.dataTransfer.files;
      const filesArray = Array.from(droppedFiles).filter((file) => file.type === 'application/pdf');
      if (filesArray.length !== droppedFiles.length) {
          toast.warn("We accept only pdf files");
      }
      setFileData(filesArray);
      console.log(filesArray);
      setState("preview");
  }

    function handleChoose(e) {
      // console.log(e);
      const files = document.getElementsByClassName('choose-file')[0].files;
      const filesArray = Array.from(files).filter((file) => file.type === 'application/pdf');
      if (filesArray.length !== files.length) {
          toast.warn("We accept only pdf files");
      }
      setFileData(filesArray);
      console.log(filesArray);
      setState("preview");
  }

    useEffect(() => {
        const len = fileData ? Object.values(fileData).length : 0;
        for (let i = 0; i < len; i++) {
          // console.log(fileData)
          // if(fileData[i].type.split('/')[1]==='pdf')
          if (fileData[i].size > 5e+7) {
            toast.warning("File size greater than 50MB");
            setFileData([]);
          }
        } 
      }, [fileData]);

    function copyToken(token){
        navigator.clipboard.writeText(token);
        toast.success("Text copied",{
        autoClose: 2000
      })
    }

    // useEffect(() => {
    //   if(inputValue || state!=='location'){
    //     clearInterval(intervalId)
    //     return ()=>clearInterval(intervalId);
    //   }
    //   // if(state!=='location'){
    //   //   if(intervalId){
    //   //     clearInterval(intervalId);
    //   //     return;
    //   //   }
    //   // }
    //   intervalId = setInterval(() => {
    //     setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    //   }, 3000); 
    //   // return () => clearInterval(intervalId);
    // }, [state]);

    useEffect(() => {
      if (inputValue || state !== 'location') {
        clearInterval(intervalId);
        return () => clearInterval(intervalId);
      }
    
      intervalId = setInterval(() => {
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
      }, 3000);
    
      // Clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    }, [inputValue]);

    function getLocation(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
        toast.error("Geolocation is not supported by this browser");
      }
    }

    function showPosition(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log("Latitude: " + latitude + "<br>Longitude: " + longitude);
    }

    function showError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error("User denied the request for Geolocation.")
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error("Location information is unavailable.")
          break;
        case error.TIMEOUT:
          toast.error("The request to get user location timed out.")
          break;
        case error.UNKNOWN_ERROR:
          toast.error("An unknown error occurred.")
          break;
      }
    }

    async function shopSearch(){
      try {
        const response = await fetch('http://localhost:5000/shop/find-shop/', {
          method: 'POST',
          // credentials: 'include',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ inputValue }), 
        });
        if (!response.ok) {
          console.error('Error in searching shops:', response.statusText);
          toast('Error in searching shops');
          return;
        }    
        const data = await response.json();
        setShopList(data);
        // console.log('******', data);
        } catch (error) {
            console.error('Error during shop search:', error);
        }
    }

    function convertTimeFormat(inputTime) {
      const [hours, minutes] = inputTime.split(':').map(Number);
      let convertedHours = hours % 12 || 12;
      const period = hours < 12 ? 'AM' : 'PM';
      const resultTime = `${convertedHours}:${minutes<10?'0'+minutes:minutes} ${period}`;
      return resultTime;
  }

    useEffect(()=>{
      console.log('PrintFile component rendered');
      const searchInput=document.getElementsByClassName('search-input')[0];
      if(searchInput){
        if(inputValue!=''){
          searchInput.style.background='#e9f3ff';
        }
        else{
          searchInput.style.background='transparent';
        }
      }
      if(inputValue.length>=2){
        shopSearch();
      }
    },[inputValue])

    // let fetchShop;
    // useEffect(()=>{
    //   if(state==='done'){
    //     console.log("Damnn")
    //     fetchShop=setInterval(async ()=>{
    //       try {
    //         const response = await fetch('http://localhost:5000/shop/fetch-shop/', {
    //           method: 'POST',
    //           // credentials: 'include',
    //           headers: {
    //             'Content-Type': 'application/json', 
    //           },
    //           body: JSON.stringify(selectedShop), 
    //         });
    //         if (!response.ok) {
    //           console.error('Error in searching shops:', response.statusText);
    //           toast('Error in searching shops');
    //           return;
    //         }    
    //         const data = await response.json();
    //         // setShopList(data);
    //         console.log('******', data.shop);
    //         setSelectedShop(data.shop)
    //         } catch (error) {
    //             console.error('Error during shop search:', error);
    //         }
    //     },1000*30)
    //   }
    // },[state])

    function handlePageRangeChange(e,index){
      tempArr=fileData;
      // console.log(e.target.value)
      tempArr[index].pageRange=e.target.value;
      setFileData(tempArr);
      calculatePrice(index)
    }

    function handlePagesToBePrinted(e,index){
      tempArr=fileData;
      tempArr[index].pagesToBePrinted=e.target.value
      setFileData(tempArr)
      calculatePrice(index)
    }

    function handlePageColorChange(e,index){
      tempArr=fileData;
      // console.log(e.target.value)
      tempArr[index].pageColor=e.target.value;
      setFileData(tempArr);
      calculatePrice(index)
    }

    function handleNumberOfCopiesChange(e,index){
      tempArr=fileData;
      // console.log(e.target.value)
      tempArr[index].numberOfCopies=e.target.value;
      setFileData(tempArr);
      calculatePrice(index)
    }

    function handlePageMethodChange(e,index){
      tempArr=fileData;
      // console.log(e.target.value)
      tempArr[index].pageMethod=e.target.value;
      setFileData(tempArr);
      calculatePrice(index)
    } 

    function handleNoteChange(e,index){
      tempArr=fileData;
      tempArr[index].note=e.target.value;
      setFileData(tempArr)
    }

    function calculatePrice(index) {
      setFileData((prevFileData) => {
        const tempArr = [...prevFileData];
        const tempFile = tempArr[index];
        let price = 0;
    
        if (tempFile.pageRange === 'All') {
          if (tempFile.pageColor === 'Color') {
            price = tempFile.pages * selectedShop.color;
          } else {
            price = tempFile.pages * selectedShop.bnw;
          }
        } else {
          try{
            // let tempPages=tempFile.pagesToBePrinted.split(',');
            // tempPages.forEach(item=>{
            //   let tempItem=item.split('-');
            //   tempItem.map((item)=>item.trim())
            //   console.log(tempItem);
            // })
            let tempPages=handlePageRange(tempFile.pagesToBePrinted);
            if (tempFile.pageColor === 'Color') {
              price = tempPages * selectedShop.color;
            } else {
              price = tempPages * selectedShop.bnw;
            }
          }
          catch(err){
            console.log(err)
            // toast("Your Input seems invalid")
          }
        }
    
        tempArr[index].price = price;
        return tempArr;
      });
      calculateTotalPrice();
    }

    function handlePageRange(rangeInput) {
      const pageRanges = rangeInput.split(","); // Split multiple ranges
      let selectedPages = 0;
    
      pageRanges.forEach(range => {
        if (range.indexOf("-") === -1) {
          selectedPages++; 
        } else {
          const [start, end] = range.trim().split("-").map(Number);
          if (start > end) {
            console.error("Invalid page range: start page cannot be greater than end page.");
            return;
          }
          selectedPages += end - start + 1; 
        }
      });
    
      return selectedPages;
    }
    function calculateTotalPrice(){
      setTotalPrice(()=>{
          let tempPrice=0;
          if(fileData){
            Object.values(fileData).forEach((file)=>{
              // console.log("File is: ",file.price)
              tempPrice+=file.price*file.numberOfCopies
            })
            // console.log("Temp Price is: ",tempPrice)
            return tempPrice;
          }
      }) 
    }

    useEffect(()=>{
      console.log("Shit")
      if(state==='preview'){
        setTimeout(()=>{
          calculateTotalPrice()
        },1000)
      }
    },[state])

    return (
        <>
            {
            state==="location"?
            <form className="store-select-form" encType="multipart/form-data">
              {console.log("Location")}
                <p className="send-heading" >Please select your print shop</p>  
                <div className="location-selection">
                  <div className="search-bar">
                    Search by: 
                    <div className="search-input-div">
                      <div className="input-animation">{placeholders[placeholderIndex]}</div>
                      <input type="text" className={`search-input`} onChange={(e) => setInputValue(e.target.value)}/>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="search-bar">
                    Find your nearest shop
                    <div className="get-location-div" onClick={()=>{getLocation()}}>
                      Get location <img src='https://cdn-icons-png.flaticon.com/128/3177/3177361.png'/>
                    </div>
                  </div>
                </div>
                <div className="store-search-list">
                {shopList && 
                    <>
                    {shopList.length>0 &&<>
                    <div className="shop-alert-div">
                      <p className="shop-alert">Shops highlighted in <div className="red-color-div"></div> color have stopped accepting orders for the day.</p>
                      <p className="shop-alert-2"> If you choose one of these shops, your files will be printed on the next business day.</p>
                    </div>
                    <div className="shop-list store-search-heading">
                      <div className="shop-selection"></div>
                      <div className="shop-id">Shop ID</div>
                      <div className="shop-address">Shop Name and Address</div>
                      <div className="shop-prints">Availibility/Price</div>
                      <div className="shop-timing">Timings</div>
                    </div>
                    </>
                    }
                    </>
                  }
                    {shopList && shopList.map((shop,index)=>(
                      <>
                      {/* <div key={index} className="shop-list" onClick={()=>{selectedShop & (shop._id===selectedShop._id)?setSelectedShop():setSelectedShop(shop)}}> */}
                      {/* {shop.on?"":"This shop is not accepting orders anymore, if you select this shop, you will receive your items on the next working day"} */}
                      <div key={index} className={`shop-list ${!shop.on?"shop-list-red":""}`} onClick={()=>{shop===selectedShop?setSelectedShop():setSelectedShop(shop)}}>
                      {/* // <div key={index} className="shop-list" onClick={()=>{console.log(shop)}}> */}
                          {/* {console.log(shop._id)} */}
                          <div className="shop-selection">
                            <div className={`selection-box ${selectedShop===shop?"selected-shop":""}`} ></div>
                          </div>
                          <div className="shop-id">
                            {/* <h2 className="shop-id-heading">Shop ID</h2> */}
                            <p>{shop.shopId}</p>
                          </div>
                          <div className="shop-address">
                            {/* <h2 className="shop-address-name">{shop.shopName}</h2> */}
                            {/* <h2 className="shop-address-name">{shop.shopName}</h2> */}
                            <p>{shop.shopName}</p>
                            <p>{shop.address[0]}</p>
                            <p>{shop.address[1]},{shop.address[2]}</p>
                          </div>
                          <div className="shop-prints">
                            {/* <h2 className="shop-cost-heading">Availability/Price</h2> */}
                            <p>Black and White: {shop.blackPrints?"₹"+shop.bnw:"unavailable"}</p>
                            <p>Color: {shop.colorPrints?"₹"+shop.color:"unavailable"}</p>
                            <p>{shop.address[3]}</p>
                          </div>
                          <div className="shop-timing">
                            {/* <h2 className="shop-timing-heading">Timings</h2> */}
                            {/* <p>Opening Time: {shop.timings.open}</p> */}
                            {/* <p>Closeing Time: {shop.timings.close}</p> */}
                            <p>{convertTimeFormat(shop.timings.open)} - {convertTimeFormat(shop.timings.close)}</p>
                            <p>{shop.address[3]}</p>
                          </div>
                        </div>
                        </>
                    ))}
                </div>
                {selectedShop?<button onClick={()=>{setState('upload')}} className="animate__animated animate__fadeInUp shop-select-button">Continue</button>:<></>}
            </form>:<></>
            }
            {
            state==="upload"?<form className="send-form" encType="multipart/form-data">
                {console.log("Upload")}
                <p className="pdf-warning"><img src="https://cdn-icons-png.flaticon.com/128/2797/2797387.png"/>We are accepting only pdfs for now!</p>
                <p className="drop-p" >Drag and drop your files in the box</p>
                <div className="drop-area" onDrop={(e)=>{handleDrop(e)}} onDragOver={(e)=>{e.preventDefault()}}>
                    <div className="drop-cover">
                        {/* <img className="drop-plus" src="https://cdn-icons-png.flaticon.com/128/32/32563.png" alt="plus"/> */}
                    </div>
                </div>
                <div className="select-files">
                    <p className="drop-p">Or select files here</p>
                    <input type="file" multiple className="choose-file" onChange={(e)=>{handleChoose(e)}}/>   
                </div>
            </form>:<></>
            }
            {
                state==="preview"?
                <>
                {console.log("Preview")}
                {/* {console.log(pageArray)} */}
                {/* {console.log(fileData)} */}
                {/* <div className="zoom-div"></div> */}
                    <main className="send-main">
                        <h2 className="send-heading">Selected Files: </h2>
                        <div className="print-preview-section">
                            {/* {fileData.map((item,index)=>( */}
                            {Object.values(fileData).map((item,index)=>(
                                <form className="print-preview-container" key={index}>
                                {/* {tempArr=item} */}
                                    {item.type==='application/pdf' && <PdfViewer selectedShop={selectedShop} index={index} pdfFile={item} fileData={fileData} setFileData={setFileData} setTotalPrice={setTotalPrice} className="item-preview-image" />}
                                    {/* {item.type.startsWith('image/')&&<img className="item-preview-image" src={URL.createObjectURL(item)} alt="item"/>} */}
                                    {/* {(item.type!=='application/pdf' && item.type.startsWith('image')===false )&&<img className="item-preview-image-default" src='https://cdn-icons-png.flaticon.com/128/2541/2541988.png' alt="item"/>} */}
                                    <div className="print-details">
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">File name:</h3>
                                        <p className="file-name">{item.name}</p>
                                      </div>

                                      {/* const [pageRange , setPageRange] = useState();
                                      const [printType , setPrintType] = useState();
                                      const [printMethod , setPrintMethod] = useState(); */}
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">Pages to be printed:</h3>
                                        <select onChange={(e)=>{handlePageRangeChange(e,index)}}>
                                          {/* <option>Page range</option> */}
                                          <option  >All</option>
                                          <option >Custom</option>
                                        </select>
                                        {/* {console.log(pageRange)} */}
                                        {item.pageRange==='Custom'?<input type="text" className="custom-input" onChange={(e)=>{handlePagesToBePrinted(e,index)}} placeholder="eg: 1-4, 5-6, 7, 8"/>:<></>}
                                      </div>
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">Print color:</h3>
                                        <select  onChange={(e)=>{handlePageColorChange(e,index)}}>
                                          {/* <option>Print type</option> */}
                                          <option>Color</option>
                                          <option>Black and White</option>
                                        </select>
                                      </div>
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">Print method:</h3>
                                      <select onChange={(e)=>{handlePageMethodChange(e,index)}}>
                                        {/* <option>Print method</option> */}
                                        <option >Both sides</option>
                                        <option >Interleafed</option>
                                      </select>
                                      </div>
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">Number of copies:</h3>
                                        <input className="number-of-copies" min={1} onChange={(e)=>{handleNumberOfCopiesChange(e,index)}} type="number" value={item.numberOfCopies} />
                                      </div>
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">Price:</h3>
                                        {/* ₹{item.pageRange==='All'?item.pageColor==='Color'?item.pages*selectedShop.color : item.pages*selectedShop.bnw : ""} */}
                                        ₹{item.price*item.numberOfCopies}
                                      </div>
                                      <div className="print-details-div">
                                        <h3 className="print-page-heading">Add a note:</h3>
                                        <textarea className="search-text" rows={1} placeholder="Write here..." onChange={(e)=>{handleNoteChange(e,index)}}></textarea>
                                      </div>
                                    </div>
                                 </form>
                                ))}
                              </div>
                              <div className="print-total-cost">
                                Total Price: {totalPrice}
                              </div>
                        <div className="cancel-upload">
                            <button className="cancel-button" onClick={()=>{setState("upload")}}>Cancel</button>
                            <button className="upload-button" onClick={()=>{setState("payment")}}>Proceed to Pay</button>
                        </div>
                    </main>
                </>:<></>
            }
            {
                state==="payment"?
                <>
                    <main className="send-main">
                        <div className="done-div">    
                            <h2 className="send-heading">Payment Gateway</h2>
                        </div>
                        <div>
                            The shop is currently executing order number {selectedShop.currentToken} <br/>
                            Your estimated order number is {selectedShop.tokenNumber+1}
                        </div>
                        <div className="priority-print-option">
                            <div className={`priority-tick ${priorityPrint?'priority-select':""}`} onClick={()=>{setPriorityPrint(!priorityPrint)}}></div>
                            <div className="print-text">
                              Choose Priority Printing
                              (charges ₹10 extra)
                              <p>When you choose priority print, we ensure that the shop prints your files on priority</p>
                            </div>
                        </div>
                            <div className="send-heading pay">
                              Amount Payable: ₹{!priorityPrint?totalPrice:totalPrice+10}
                            </div>

                       <div className="cancel-upload">
                            <button className="cancel-button" onClick={()=>{setState("preview")}}>Cancel</button>
                            <button className="upload-button" onClick={(e)=>{submitForm(e)}}>Pay</button>
                        </div>

                    </main>
                </>:<></>
            }
            {/* {
                state==="done"?
                <>
                    <main className="send-main">
                            <h2 className="send-heading">Your order number is: {userToken}</h2>
                            <h2 className="send-heading">The shop is currently printing order number: {selectedShop.currentToken}</h2>

                        <p>
                          You will be notified when your order gets ready
                        </p>

                    </main>
                </>:<></>
            } */}
        </>
    )
}

export { PrintFile }