import { useEffect, useState } from "react"
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { PulseLoader } from "react-spinners";
//  import crossSign from "../Assets/remove.png"
import crossSign from "../Assets/cross.png"
import backSign from "../Assets/back.png"
import { Document, Page, pdfjs } from 'react-pdf';
import { getApiUrl } from "../Redux";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
const apiUrl = getApiUrl()

const PdfViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState(null);
  // console.log(file)
  useEffect(() => {
    const fetchPdfData = async () => {
      try {
        const response = await fetch(`${apiUrl}/print/get-pdf`, {
          method: "POST",
          credentials: "omit",
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/pdf',
          },
          body: JSON.stringify({ file })
        });
        const data = await response.blob();
        // const data = await response.json();
        setPdfData(data);
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };

    fetchPdfData();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pdf-div">
      <Document className='pdf-doc'
        file={pdfData}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page className='pdf-page' height={350} renderTextLayer={false} pageNumber={pageNumber} devicePixelRatio={7} />
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



function SingleOrder({ user, order, cross, getPrintDetails, reRender, setReRender }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  // let user=useSelector((state)=>state.user.user);
  let fileInfo = order.fileInfo;

  useEffect(() => {
    if (reRender) {
      getPrintDetails(order._id)
      setReRender(false)
    }
  }, [reRender])

  if (!user) {
    toast("Unauthorized Access", {
      progressStyle: { background: '#95befb' }
    })
    navigate('/')
  }

  useEffect(() => {
    getPrintDetails(order._id)
    console.log("Shit")
  }, [])

  let intervalId;

  function getISTTime(utcTimestamp) {
    const date = new Date(utcTimestamp);
    date.setUTCHours(date.getUTCHours());
    date.setUTCMinutes(date.getUTCMinutes());

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    const formattedTime = `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

    return formattedTime;
  }

  useEffect(() => {
    if (!order.active) {
      clearInterval(intervalId)
    }
    intervalId = setInterval(() => {
      getPrintDetails(order._id);
    }, 30000);
    return () => clearInterval(intervalId);
  }, [order._id, getPrintDetails]);

  return (
    <>
      <main className="shop-order-main user-order-main">
        <img alt="back" className="back-button" onClick={() => { cross() }} src={backSign} />
        {order && order.active ? (
          <div className="single-order-top-div">
            {!order.priority ? (
              <>
                <section className="passive-order">
                  <div>
                    <p>Order number</p>
                    <p>{order.tokenNumber}</p>
                  </div>
                  <div>
                    <p>Order number being processed</p>
                    <p>{order.shop.currentToken}</p>
                  </div>
                  <div>
                    <p>Ordered at</p>
                    <p> {getISTTime(order.createdAt)} &nbsp; {order.createdAt.split('T')[0]}</p>
                  </div>
                  <div>
                    <p>Files sent</p>
                    <p> {order.files.length}</p>
                  </div>
                  <div>
                    <p>Amount paid</p>
                    <p> ₹{order.totalPrice}</p>
                  </div>
                </section>
              </>
            ) : (
              <section className="passive-order">
                <div>
                  <p>Order number</p>
                  <p>none (priority print)</p>
                </div>
                <div>
                  <p>Ordered at</p>
                  <p> {getISTTime(order.createdAt)} &nbsp; {order.createdAt.split('T')[0]}</p>
                </div>
                <div>
                  <p>Files sent</p>
                  <p> {order.files.length}</p>
                </div>
                <div>
                  <p>Amount paid</p>
                  <p> ₹{order.totalPrice + 10}</p>
                </div>
              </section>
            )}
          </div>
        ) : (
          <section className="passive-order">
            <div>
              <p>Order number</p>
              <p> {order.tokenNumber}</p>
            </div>
            <div>
              <p>Ordered at</p>
              <p> {getISTTime(order.createdAt)} &nbsp; {order.createdAt.split('T')[0]}</p>
            </div>
            <div>
              <p>Completed at</p>
              <p> {getISTTime(order.updatedAt)} &nbsp; {order.updatedAt.split('T')[0]}</p>
            </div>
            <div>
              <p>Files sent</p>
              <p> {order.files.length}</p>
            </div>
            <div>
              <p>Amount paid</p>
              <p> ₹{order.totalPrice}</p>
            </div>
          </section>
        )}
        <section className="single-order-bottom">
          <div className="shop-details">
            <h2 className="send-heading">Shop details</h2>
            <div className="single-order-shop-details">
              <div className="single-order-shop-details-left">
                <p>{order.shop.shopName}</p>
                {order.shop.address &&
                  <>
                    <p>{order.shop.address[0]}</p>
                    <p>{order.shop.address[1]}</p>
                  </>
                }
              </div>
              <div className="single-order-shop-details-right">
                <a href={`tel:${order.shop.phone}`}><img alt="phone" src='https://cdn-icons-png.flaticon.com/128/0/488.png' />{order.shop.phone}</a>
                <a href={`mailto:${order.shop.email}`}><img alt="email" src='https://cdn-icons-png.flaticon.com/128/2099/2099199.png' /> {order.shop.email}</a>

              </div>
            </div>
          </div>
          <h2 className="send-heading">Files sent</h2>
          <section className="single-order-details">
            <div className="user-files">
              {order.files.map((file, index) => {
                return (
                  <div className="user-single-order">
                    {/* <div className="shop-order-number">{index+1}</div> */}
                    <div className="shop-details-container">
                      <PdfViewer file={file} />
                      <div className="shop-order-right">
                        <div>
                          <h3>File name</h3>
                          <p>{file.originalname}</p>
                        </div>
                        <div>
                          <h3>Pages to be printed</h3>
                          <p>{fileInfo[index].pageRange}</p>
                        </div>
                        <div>
                          <h3>Color</h3>
                          <p>{fileInfo[index].pageColor}</p>
                        </div>
                        <div>
                          <h3>Method</h3>
                          <p>{fileInfo[index].pageMethod}</p>
                        </div>
                        <div>
                          <h3>Number of copies</h3>
                          <p>{fileInfo[index].numberOfCopies}</p>
                        </div>
                        <div>
                          <h3>Amount received for this file</h3>
                          <p>₹{fileInfo[index].price}</p>
                        </div>
                        <div>
                          <h3>Note</h3>
                          <p>{fileInfo[index].note == "" ? "none" : fileInfo[index].note}</p>
                        </div>
                      </div>
                    </div>
                    {/* <button className="download-button" onClick={()=>{singleDownload(file)}}>Download</button> */}
                  </div>
                )
              })}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

export { SingleOrder };
