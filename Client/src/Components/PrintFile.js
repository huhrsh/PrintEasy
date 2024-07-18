import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from "react-redux";
import { Document, Page, pdfjs } from 'react-pdf';
import 'animate.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { getApiUrl } from "../Redux";
import { PulseLoader } from 'react-spinners'
import '../Styles/print.css'
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


const PdfViewer = ({ index, pdfFile, fileData, setFileData, selectedShop, setTotalPrice }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  let temp = Object.values(fileData)

  const onDocumentLoadSuccess = ({ numPages }) => {
    temp[index].pages = numPages;
    temp[index].pageRange = 'All'
    temp[index].pageMethod = 'Single'
    temp[index].pageColor = 'Color'
    temp[index].note = ""
    temp[index].numberOfCopies = 1
    temp[index].price = numPages * selectedShop.color;
    setFileData(temp);
    setNumPages(numPages);
  };

  return (
    <div className="pdf-div">
      <Document className={temp[index].pageColor == 'Color' ? "pdf-doc" : "pdf-doc bnw-page"}
        file={pdfFile}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page className='pdf-page' height={370} renderTextLayer={false} pageNumber={pageNumber} devicePixelRatio={7} />
      </Document>
      <div className="document-pages">
        <div className="page-minus" onClick={() => { pageNumber > 1 ? setPageNumber(pageNumber - 1) : setPageNumber(pageNumber) }}><img src='https://cdn-icons-png.flaticon.com/128/56/56889.png' /></div>
        <p>
          {pageNumber} / {numPages}
        </p>
        <div className="page-plus" onClick={() => { pageNumber < numPages ? setPageNumber(pageNumber + 1) : setPageNumber(pageNumber) }}><img src='https://cdn-icons-png.flaticon.com/128/3524/3524388.png' /></div>
      </div>
    </div>
  );
};

function PrintFile() {
  const user = useSelector((state) => state.user.user);
  const navigator = useNavigate();
  const userCheckedRef = useRef(false);

  useEffect(() => {
    if (!userCheckedRef.current && !user) {
      toast("Please login to proceed", {
        progressStyle: { background: '#95befb' },
      });
      navigator('/sign-in');
      userCheckedRef.current = true;
    }
  }, [user, navigator]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState("location")
  const [fileData, setFileData] = useState();
  const [uploadedFile, setUploadedFile] = useState()
  const [compressedId, setCompressedId] = useState()
  const [inputValue, setInputValue] = useState('print');
  const [inputAnimation, setInputAnimation] = useState(true)
  const placeholders = ['Shop Name', 'Location', 'Shop ID'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [shopList, setShopList] = useState();
  const [totalPrice, setTotalPrice] = useState("Calculating...")
  const [selectedShop, setSelectedShop] = useState();
  const [priorityPrint, setPriorityPrint] = useState(false);
  const [userToken, setUserToken] = useState();
  const apiUrl = getApiUrl()

  let tempArr;
  let intervalId;

  async function submitForm(e) {
    e.preventDefault();
    let fileInfo = [];
    const formData = new FormData();
    for (let i = 0; i < fileData.length; i++) {
      formData.append(`file`, fileData[i]);
      fileInfo.push({ pages: fileData[i].pages, pageRange: fileData[i].pageRange, pageColor: fileData[i].pageColor, pageMethod: fileData[i].pageMethod, note: fileData[i].note, price: fileData[i].price * fileData[i].numberOfCopies, numberOfCopies: fileData[i].numberOfCopies })
    }
    formData.append('shop', selectedShop._id);
    formData.append('user', user._id)
    formData.append('priority', priorityPrint);
    formData.append('totalPrice', totalPrice);
    formData.append("fileInfo", JSON.stringify(fileInfo))
    // console.log("Form Data is: ", formData)
    setLoading(true)
    const response = await fetch(apiUrl + '/print/new-print', {
      method: 'POST',
      body: formData,
    })
    const responseData = await response.json();
    if (responseData.message) {
      toast.error(responseData.message);
    }
    // console.log("Response is: ",responseData);
    toast.success(responseData.text);
    // setUserToken(responseData.tokenNumber);
    // setUploadedFile(responseData.file)
    // console.log(responseData);
    // console.log(uploadedFile)
    setLoading(false)
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
    // console.log(filesArray);
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
    // console.log(filesArray);
    setState("preview");
  }

  useEffect(() => {
    const len = fileData ? Object.values(fileData).length : 0;
    for (let i = 0; i < len; i++) {
      if (fileData[i].size > 5e+7) {
        toast.warning("File size greater than 50MB");
        setFileData([]);
      }
    }
  }, [fileData]);

  function copyToken(token) {
    navigator.clipboard.writeText(token);
    toast.success("Text copied", {
      autoClose: 2000
    })
  }
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
    // console.log("Latitude: " + latitude + "<br>Longitude: " + longitude);
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
      default:
        break;
    }
  }

  async function shopSearch() {
    try {
      const response = await fetch(apiUrl + '/shop/find-shop/', {
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
    } catch (error) {
      console.error('Error during shop search:', error);
    }
  }

  function convertTimeFormat(inputTime) {
    const [hours, minutes] = inputTime.split(':').map(Number);
    let convertedHours = hours % 12 || 12;
    const period = hours < 12 ? 'AM' : 'PM';
    const resultTime = `${convertedHours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
    return resultTime;
  }

  useEffect(() => {
    // console.log('PrintFile component rendered');
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
  }, [inputValue])

  function handlePageRangeChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].pageRange = e.target.value;
    setFileData(tempArr);
    calculatePrice(index)
  }

  function handlePagesToBePrinted(e, index) {
    tempArr = fileData;
    tempArr[index].pagesToBePrinted = e.target.value
    setFileData(tempArr)
    calculatePrice(index)
  }

  function handlePageColorChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].pageColor = e.target.value;
    setFileData(tempArr);
    calculatePrice(index)
  }

  function handleNumberOfCopiesChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].numberOfCopies = e.target.value;
    setFileData(tempArr);
    calculatePrice(index)
  }

  function handlePageMethodChange(e, index) {
    tempArr = fileData;
    // console.log(e.target.value)
    tempArr[index].pageMethod = e.target.value;
    setFileData(tempArr);
    calculatePrice(index)
  }

  function handleNoteChange(e, index) {
    tempArr = fileData;
    tempArr[index].note = e.target.value;
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
        try {
          let tempPages = handlePageRange(tempFile.pagesToBePrinted);
          if (tempFile.pageColor === 'Color') {
            price = tempPages * selectedShop.color;
          } else {
            price = tempPages * selectedShop.bnw;
          }
        }
        catch (err) {
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
  function calculateTotalPrice() {
    setTotalPrice(() => {
      let tempPrice = 0;
      if (fileData) {
        Object.values(fileData).forEach((file) => {
          tempPrice += file.price * file.numberOfCopies
        })
        return tempPrice;
      }
    })
  }

  useEffect(() => {
    if (state === 'preview') {
      setTimeout(() => {
        calculateTotalPrice()
      }, 1000)
    }
  }, [state])

  return (
    loading === true ? <PulseLoader color="#333" className="loader" /> :
      <>
        <>
          {
            state === "location" ?
              <form className="store-select-form" encType="multipart/form-data">
                <p className="send-heading" >Please select your print shop</p>
                <div className="location-selection">
                  <div className="search-bar">
                    Search by:
                    <div className="search-input-div">
                      <div className="input-animation">{placeholders[placeholderIndex]}</div>
                      <input type="text" className={`search-input`} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="search-bar">
                    Find your nearest shop
                    <div className="get-location-div" onClick={() => { getLocation() }}>
                      Get location <img alt="location" src='https://cdn-icons-png.flaticon.com/128/3177/3177361.png' />
                    </div>
                  </div>
                </div>
                <div className="store-search-list">
                  {shopList &&
                    <>
                      {shopList.length > 0 && <>
                        <div className="shop-alert-div">
                          <div className="shop-alert">Shops highlighted in <div className="red-color-div"></div> color have stopped accepting orders for the day.</div>
                          <p className="shop-alert-2"> If you choose one of these shops, your files will be printed on the next business day.</p>
                        </div>
                        <div className="shop-list2 store-search-heading">
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
                  <br className="sm:hidden" />
                  {shopList && shopList.map((shop, index) => (
                    <>
                      <div key={index} className={`shop-list ${!shop.on ? "shop-list-red" : ""}`} onClick={() => { shop === selectedShop ? setSelectedShop() : setSelectedShop(shop) }}>
                        <div className="shop-selection">
                          <div className={`selection-box ${selectedShop === shop ? "selected-shop" : ""}`} ></div>
                        </div>
                        <div className="shop-id">
                          <p>{shop.shopId}</p>
                        </div>
                        <div className="shop-address">
                          <p>{shop.shopName}</p>
                          <p>{shop.address[0]}</p>
                          <p>{shop.address[1]},{shop.address[2]}</p>
                        </div>
                        <div className="shop-prints">
                          <p>Black and White: {shop.blackPrints ? "₹" + shop.bnw : "unavailable"}</p>
                          <p>Color: {shop.colorPrints ? "₹" + shop.color : "unavailable"}</p>
                          <p>{shop.address[3]}</p>
                        </div>
                        <div className="shop-timing">
                          <p>{convertTimeFormat(shop.timings.open)} - {convertTimeFormat(shop.timings.close)}</p>
                          <p>{shop.address[3]}</p>
                        </div>
                      </div>

                      <div key={index} className={`shop-list-mobile ${!shop.on ? "shop-list-red" : ""}`} onClick={() => { shop === selectedShop ? setSelectedShop() : setSelectedShop(shop) }}>
                        <div className="shop-selection">
                          <div className={`selection-box ${selectedShop === shop ? "selected-shop" : ""}`} ></div>
                        </div>
                        <div className=" w-full">
                          <div className="shop-id">
                            <h4>Shop ID  :</h4>
                            <p>{shop.shopId}</p>
                          </div>
                          <div className="shop-address">
                            <h4>Address  :</h4>
                            <p>{shop.shopName}</p>
                            <p>{shop.address[0]}</p>
                            <p>{shop.address[1]},{shop.address[2]}</p>
                          </div>
                          <div className="shop-prints">
                            <h4>Price/Availibility  :</h4>
                            <p>Black and White: {shop.blackPrints ? "₹" + shop.bnw : "unavailable"}</p>
                            <p>Color: {shop.colorPrints ? "₹" + shop.color : "unavailable"}</p>
                            <p>{shop.address[3]}</p>
                          </div>
                          <div className="shop-timing">
                            <h4>Timings :</h4>
                            <p>{convertTimeFormat(shop.timings.open)} - {convertTimeFormat(shop.timings.close)}</p>
                            <p>{shop.address[3]}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
                {selectedShop ? <button onClick={() => { setState('upload') }} className="animate__animated animate__fadeInUp shop-select-button">Continue</button> : <></>}
              </form> : <></>
          }
          {
            state === "upload" ? <form className="send-form" encType="multipart/form-data">
              <p className="pdf-warning"><img src="https://cdn-icons-png.flaticon.com/128/2797/2797387.png" alt="warning" />We are accepting only pdfs for now!</p>
              <p className="drop-p" >Drag and drop your files in the box</p>
              <div className="drop-area" onDrop={(e) => { handleDrop(e) }} onDragOver={(e) => { e.preventDefault() }}>
                <div className="drop-cover">
                  {/* <img className="drop-plus" src="https://cdn-icons-png.flaticon.com/128/32/32563.png" alt="plus"/> */}
                </div>
              </div>
              <div className="select-files">
                <p className="drop-p">Or select files here</p>
                <input type="file" multiple className="choose-file" onChange={(e) => { handleChoose(e) }} />
              </div>
            </form> : <></>
          }
          {
            state === "preview" ?
              <>
                <main className="send-main mb-8">
                  <h2 className="send-heading">Selected Files: </h2>
                  <div className="print-preview-section">
                    {Object.values(fileData).map((item, index) => (
                      <form className="print-preview-container" key={index}>
                        {item.type === 'application/pdf' && <PdfViewer selectedShop={selectedShop} index={index} pdfFile={item} fileData={fileData} setFileData={setFileData} setTotalPrice={setTotalPrice} className="item-preview-image" />}
                        <div className="print-details">
                          <div className="print-details-div">
                            <h3 className="print-page-heading">File name:</h3>
                            <p className="file-name">{item.name}</p>
                          </div>
                          <div className="print-details-div flex-wrap">
                            <h3 className="print-page-heading">Pages to be printed:</h3>
                            <select onChange={(e) => { handlePageRangeChange(e, index) }}>
                              <option  >All</option>
                              <option >Custom</option>
                            </select>
                            {item.pageRange === 'Custom' ? <input type="text" className="custom-input" onChange={(e) => { handlePagesToBePrinted(e, index) }} placeholder="eg: 1-4, 5-6, 7, 8" /> : <></>}
                          </div>
                          <div className="print-details-div">
                            <h3 className="print-page-heading">Print color:</h3>
                            <select onChange={(e) => { handlePageColorChange(e, index) }}>
                              <option>Color</option>
                              <option>Black and White</option>
                            </select>
                          </div>
                          <div className="print-details-div">
                            <h3 className="print-page-heading">Print method:</h3>
                            <select onChange={(e) => { handlePageMethodChange(e, index) }}>
                              {/* <option>Print method</option> */}
                              <option >Both sides</option>
                              <option >Interleafed</option>
                            </select>
                          </div>
                          <div className="print-details-div">
                            <h3 className="print-page-heading">Number of copies:</h3>
                            <input className="number-of-copies" min={1} onChange={(e) => { handleNumberOfCopiesChange(e, index) }} type="number" value={item.numberOfCopies} />
                          </div>
                          <div className="print-details-div">
                            <h3 className="print-page-heading">Price:</h3>
                            {/* ₹{item.pageRange==='All'?item.pageColor==='Color'?item.pages*selectedShop.color : item.pages*selectedShop.bnw : ""} */}
                            ₹{item.price * item.numberOfCopies}
                          </div>
                          <div className="print-details-div">
                            <h3 className="print-page-heading">Add a note:</h3>
                            <textarea className="search-text" rows={1} placeholder="Write here..." onChange={(e) => { handleNoteChange(e, index) }}></textarea>
                          </div>
                        </div>
                      </form>
                    ))}
                  </div>
                  <div className="print-total-cost">
                    Total Price: ₹ {totalPrice}
                  </div>
                  <div className="cancel-upload">
                    <button className="cancel-button" onClick={() => { setState("upload") }}>Cancel</button>
                    <button className="upload-button" onClick={() => { setState("payment") }}>Proceed to Pay</button>
                  </div>
                </main>
              </> : <></>
          }
          {
            state === "payment" ?
              <>
                <main className="send-main">
                  <div className="done-div">
                    <h2 className="send-heading">Payment Gateway</h2>
                  </div>
                  <div className="max-sm:text-xl sm:text-xl">
                    The shop is currently executing order number <b>{selectedShop.currentToken}</b> <br />
                    Your estimated order number is <b>{selectedShop.tokenNumber + 1}</b>
                  </div>
                  <div className="priority-print-option">
                    <div className="flex items-center gap-5 sm:flex-shrink-0 sm:w-fit">
                      <div className={`priority-tick ${priorityPrint ? 'priority-select' : ""}`} onClick={() => { setPriorityPrint(!priorityPrint) }}></div>
                      <div className="print-text sm:flex-shrink-0">
                        Choose Priority Printing
                        (charges ₹10 extra)
                      </div>
                    </div>
                      <p>When you choose priority print, we ensure that the shop prints your files on priority</p>
                  </div>
                  <div className="send-heading pay">
                    Amount Payable: ₹{!priorityPrint ? totalPrice : totalPrice + 10}
                  </div>
                  <div className="cancel-upload">
                    <button className="cancel-button" onClick={() => { setState("preview") }}>Cancel</button>
                    <button className="upload-button" onClick={(e) => { submitForm(e) }}>Pay</button>
                  </div>

                </main>
              </> : <></>
          }
        </>
      </>
  )
}

export { PrintFile }
