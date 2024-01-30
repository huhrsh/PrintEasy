import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { PdfViewer } from "./PrintFile";

function PrintFile() {
  const user = useSelector((state) => state.user.user);
  const navigator = useNavigate();
  const userCheckedRef = useRef(false);
  // const [pageArray,setPageArray]=useState([]);
  useEffect(() => {
    console.log(userCheckedRef);
    if (!userCheckedRef.current && !user) {
      toast("Please login to proceed", {
        progressStyle: { background: '#95befb' },
      });
      navigator('/sign-in');
      userCheckedRef.current = true;
    }
  }, [user, navigator]);

  // const [file,setFile]=useState();
  const [state, setState] = useState("location");
  const [fileData, setFileData] = useState();
  const [uploadedFile, setUploadedFile] = useState();
  const [compressedId, setCompressedId] = useState();
  const [inputValue, setInputValue] = useState('');
  const [inputAnimation, setInputAnimation] = useState(true);
  const placeholders = ['Shop Name', 'Location', 'Shop ID'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [shopList, setShopList] = useState();
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedShop, setSelectedShop] = useState();
  let tempArr;
  let intervalId;
  // const [pageRange , setPageRange] = useState("All");
  // const [printType , setPrintType] = useState("Colored");
  // const [printMethod , setPrintMethod] = useState("Single side print");
  // const [printNote, setPrintNote] =useState();
  // const [numberOfPages,setNumberOfPages]=useState();
  async function submitForm(e) {
    e.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < fileData.length; i++) {
      // console.log("ooooooooooo",fileData[i]);
      formData.append(`file`, fileData[i]);
    }
    formData.append('shop', selectedShop);
    formData.append('user', user);

    // console.log("Form Data is: ",formData)
    const response = await fetch('http://localhost:5000/print/new-print', {
      method: 'POST',
      // credentials:'include',
      // credentials:'same-origin',
      // headers: {
      //     // 'Content-Type': 'undefined',
      //     'Content-Type': 'multipart/form-data',
      //   },
      body: formData
    });

    const responseData = await response.json();
    console.log(responseData);
    toast.success(responseData.text);
    setUploadedFile(responseData.file);
    // console.log(response);
    // console.log(uploadedFile)
    setFileData([]);
    setState("payment");
  }

  // function pageRangeSelection(value){
  //   setPageRange(value);
  // }
  // function printTypeSelection(value){
  //   setPrintType(value);
  // }
  // function printMethodSelection(value){
  //   setPrintMethod(value);
  // }
  function handleDrop(e) {
    e.preventDefault();
    console.log(e.dataTransfer.files);
    setFileData(e.dataTransfer.files);
    setState("preview");
  }

  function handleChoose(e) {
    // console.log(e);
    const files = document.getElementsByClassName('choose-file')[0];
    setFileData(files.files);
    console.log(files.files);
    setState("preview");
  }

  useEffect(() => {
    const len = fileData ? Object.values(fileData).length : 0;
    for (let i = 0; i < len; i++) {
      // console.log(fileData)
      // if(fileData[i].type.split('/')[1]==='pdf')
      if (fileData[i].size > 50000000) {
        toast.warning("File size greater than 50MB");
        setFileData([]);
      }
    }
  }, [fileData]);

  function copyToken(token) {
    navigator.clipboard.writeText(token);
    toast.success("Text copied", {
      autoClose: 2000
    });
  }

  useEffect(() => {
    if (state !== 'location') {
      if (intervalId) {
        clearInterval(intervalId);
        return;
      }
    }
    intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);
    // return () => clearInterval(intervalId);
    if (state !== 'location') {
      clearInterval(intervalId);
    }
  }, [state]);

  function getLocation() {
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
        toast.error("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        toast.error("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        toast.error("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        toast.error("An unknown error occurred.");
        break;
    }
  }

  async function shopSearch() {
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
      console.log('******', data);
    } catch (error) {
      console.error('Error during shop search:', error);
    }
  }

  useEffect(() => {
    const searchInput = document.getElementsByClassName('search-input')[0];
    if (searchInput) {
      if (inputValue != '') {
        searchInput.style.background = '#e9f3ff';
      }
      else {
        searchInput.style.background = 'transparent';
      }
    }
    if (inputValue.length >= 2) {
      shopSearch();
    }
  }, [inputValue]);

  // function handlePageRangeChange(e,index){
  //   // tempArr=fileData;
  //   // tempArr[index].pageRange=e.target.value;
  //   setFileData((prevFileData)=>{
  //     const tempArr=[...prevFileData]
  //     tempArr[index].pageRange=e.target.value;
  //     calculatePrice(index)
  //   });
  // }
  // function handlePagesToBePrinted(e,index){
  //   setFileData((prevFileData)=>{
  //     const tempArr=[...prevFileData]
  //     tempArr[index].pagesToBePrinted=e.target.value;
  //     calculatePrice(index)
  //   });
  // }
  // function handlePageColorChange(e,index){
  //   setFileData((prevFileData)=>{
  //     const tempArr=[...prevFileData]
  //     tempArr[index].pageColor=e.target.value;
  //     calculatePrice(index)
  //   });
  // }
  // function handlePageMethodChange(e,index){
  //   setFileData((prevFileData)=>{
  //     const tempArr=[...prevFileData]
  //     tempArr[index].pageMethod=e.target.value;
  //     calculatePrice(index)
  //   });
  // }
  function handlePageRangeChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].pageRange = e.target.value;
    setFileData(tempArr);
    calculatePrice(index);
  }

  function handlePagesToBePrinted(e, index) {
    tempArr = fileData;
    tempArr[index].pagesToBePrinted = e.target.value;
    setFileData(tempArr);
    calculatePrice(index);
  }

  function handlePageColorChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].pageColor = e.target.value;
    setFileData(tempArr);
    calculatePrice(index);
  }

  function handlePageMethodChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].pageMethod = e.target.value;
    setFileData(tempArr);
    calculatePrice(index);
  }

  function handleNoteChange(e, index) {
    tempArr = fileData;
    tempArr[index].note = e.target.value;
    setFileData(tempArr);
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
        try {
          let tempPages = tempFile.pagesToBePrinted.split(',');
          tempPages.forEach(item => {
            let tempItem = item.split('-');
            console.log(tempItem);
            // console.log(tempItem.trim());
          });
          // console.log(tempPages);
        }
        catch (err) {
          toast("Your Input seems invalid");
        }
      }

      tempArr[index].price = price;
      return tempArr;
    });
    calculateTotalPrice();
  }

  function calculateTotalPrice() {
    setTotalPrice(() => {
      let tempPrice = 0;
      if (fileData) {
        fileData.forEach((file) => { tempPrice += file.price; });
        console.log("Temp Price is: ", tempPrice);
        return tempPrice;
      }
    });
  }


  // function calculatePrice(index){
  //   tempArr=fileData;
  //   let tempFile=tempArr[index];
  //   console.log("Hello: ",tempFile)
  //   let price=0;
  //   if(tempFile.pageRange==='All'){
  //     if(tempFile.pageColor==='Color'){
  //       price=tempFile.pages*selectedShop.color;
  //     }
  //     else{
  //       price=tempFile.pages*selectedShop.bnw;
  //     }
  //   }
  //   else{
  //     console.log(tempFile.pagesToBePrinted);
  //   }
  //   tempArr[index].price=price;
  //   setFileData(tempArr);
  //   // if(tempArr[index].pageColor==='Color'){
  //   // }
  // }
  return (
    <>
      {state === "location" ?
        <form className="store-select-form" encType="multipart/form-data">
          <p className="send-heading">Please select your print shop</p>
          <div className="location-selection">
            <div className="search-bar">
              Search by:
              <div className="search-input-div">
                <div className="input-animation">{placeholders[placeholderIndex]}</div>
                <input type="text" className={`search-input`} onChange={(e) => setInputValue(e.target.value)} />
              </div>
            </div>
            <div className="divider"></div>
            <div className="search-bar">
              Find your nearest shop
              <div className="get-location-div" onClick={() => { getLocation(); }}>
                Get location <img src='https://cdn-icons-png.flaticon.com/128/3177/3177361.png' />
              </div>
            </div>
          </div>
          <div className="store-search-list">
            {shopList && shopList.map((shop, index) => (
              <div key={index} className="shop-list" onClick={() => { shop._id === selectedShop ? setSelectedShop() : setSelectedShop(shop); }}>
                <div className="shop-selection">
                  <div className={`selection-box ${selectedShop ? "selected-shop" : ""}`}></div>
                </div>
                <div className="shop-id">
                  <h2 className="shop-id-heading">Shop ID</h2>
                  <p>{shop.shopId}</p>
                </div>
                <div className="shop-address">
                  {/* <h2 className="shop-address-name">{shop.shopName}</h2> */}
                  <h2 className="shop-address-name">{shop.shopName}</h2>
                  <p>{shop.address[0]}</p>
                  <p>{shop.address[1]},{shop.address[2]}</p>
                </div>
                <div className="shop-prints">
                  <h2 className="shop-cost-heading">Availability/Price</h2>
                  <p>Black and White: {shop.blackPrints ? "₹" + shop.bnw : "unavailable"}</p>
                  <p>Color: {shop.colorPrints ? "₹" + shop.color : "unavailable"}</p>
                  <p>{shop.address[3]}</p>
                </div>
                <div className="shop-timing">
                  <h2 className="shop-timing-heading">Timings</h2>
                  {/* <p>Opening Time: {shop.timings.open}</p> */}
                  {/* <p>Closeing Time: {shop.timings.close}</p> */}
                  <p>{shop.timings.open} - {shop.timings.close}</p>
                  <p>{shop.address[3]}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedShop ? <button onClick={() => { setState('upload'); }} className="animate__animated animate__fadeInUp shop-select-button">Continue</button> : <></>}
        </form> : <></>}
      {state === "upload" ? <form className="send-form" encType="multipart/form-data">
        <p className="drop-p">Drag and drop your files in the box</p>
        <div className="drop-area" onDrop={(e) => { handleDrop(e); }} onDragOver={(e) => { e.preventDefault(); }}>
          <div className="drop-cover">
            {/* <img className="drop-plus" src="https://cdn-icons-png.flaticon.com/128/32/32563.png" alt="plus"/> */}
          </div>
        </div>
        <div className="select-files">
          <p className="drop-p">Or select files here</p>
          <input type="file" multiple className="choose-file" onChange={(e) => { handleChoose(e); }} />
        </div>
      </form> : <></>}
      {state === "preview" ?
        <>
          {/* {console.log(pageArray)} */}
          {/* {console.log(fileData)} */}
          <main className="send-main">
            <h2 className="send-heading">Selected Files: </h2>
            <div className="print-preview-section">
              {/* {fileData.map((item,index)=>( */}
              {Object.values(fileData).map((item, index) => (
                <form className="print-preview-container" key={index}>
                  {/* {tempArr=item} */}
                  {item.type === 'application/pdf' && <PdfViewer selectedShop={selectedShop} index={index} pdfFile={item} fileData={fileData} setFileData={setFileData} setTotalPrice={setTotalPrice} className="item-preview-image" />}
                  {item.type.startsWith('image/') && <img className="item-preview-image" src={URL.createObjectURL(item)} alt="item" />}
                  {(item.type !== 'application/pdf' && item.type.startsWith('image') === false) && <img className="item-preview-image-default" src='https://cdn-icons-png.flaticon.com/128/2541/2541988.png' alt="item" />}
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
                      <select onChange={(e) => { handlePageRangeChange(e, index); }}>
                        {/* <option>Page range</option> */}
                        <option>All</option>
                        <option>Custom</option>
                      </select>
                      {/* {console.log(pageRange)} */}
                      {item.pageRange === 'Custom' ? <input type="text" onChange={(e) => { handlePagesToBePrinted(e, index); }} placeholder="eg: 1-4, 5-6, 7, 8" /> : <></>}
                    </div>
                    <div className="print-details-div">
                      <h3 className="print-page-heading">Print color:</h3>
                      <select onChange={(e) => { handlePageColorChange(e, index); }}>
                        {/* <option>Print type</option> */}
                        <option>Color</option>
                        <option>Black and White</option>
                      </select>
                    </div>
                    <div className="print-details-div">
                      <h3 className="print-page-heading">Print method:</h3>
                      <select onChange={(e) => { handlePageMethodChange(e, index); }}>
                        {/* <option>Print method</option> */}
                        <option>Both sides</option>
                        <option>Interleafed</option>
                      </select>
                    </div>
                    <div className="print-details-div">
                      <h3 className="print-page-heading">Price:</h3>
                      {/* ₹{item.pageRange==='All'?item.pageColor==='Color'?item.pages*selectedShop.color : item.pages*selectedShop.bnw : ""} */}
                      ₹{item.price}
                    </div>
                    <div className="print-details-div">
                      <h3 className="print-page-heading">Add a note:</h3>
                      <textarea className="search-text" rows={1} placeholder="Write here..." onChange={(e) => { handleNoteChange(e, index); }}></textarea>
                    </div>
                  </div>
                </form>
              ))}
            </div>
            <div className="print-total-cost">
              Total Price: {totalPrice}
            </div>
            <div className="cancel-upload">
              <button className="cancel-button" onClick={() => { setState("upload"); }}>Cancel</button>
              <button className="upload-button" onClick={() => { submitForm(); }}>Proceed to Pay</button>
            </div>
          </main>
        </> : <></>}
      {state === "done" ?
        <>
          <main className="send-main">
            <div className="done-div">
              <h2 className="send-heading">Your file token is:</h2>
              <div className="token-div">
                {compressedId}
                <img onClick={() => { copyToken(compressedId); }} alt="copy" className="copy-image" src="https://cdn-icons-png.flaticon.com/128/126/126498.png" />
              </div>
            </div>
            <div className="done-div">
              <h2 className="send-heading">Your file link is:</h2>
              <div className="token-div">
                <Link to={`/receive-file?token=${compressedId}`}>http://localhost:3000/receive?token={compressedId}</Link>

                <img onClick={() => { copyToken(compressedId); }} className="copy-image" src="https://cdn-icons-png.flaticon.com/128/126/126498.png" />
              </div>
            </div>
            <p>
              Files will be deleted after an hour
            </p>

          </main>
        </> : <></>}
    </>
  );
}
