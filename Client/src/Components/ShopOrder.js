import { useEffect, useState } from "react"
import { toast } from "react-toastify";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import backSign from "../Assets/back.png"
import { Document, Page, pdfjs } from 'react-pdf';
import { getApiUrl } from "../Redux";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
const apiUrl=getApiUrl()

const PdfViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState(null);
  useEffect(() => {
    const fetchPdfData = async () => {
      try {
        const response = await fetch(apiUrl+`/print/get-pdf`,{
          method:"POST",
          credentials:"omit",
          headers:{
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/pdf',
          },
          body:JSON.stringify({file})
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
    <div className="pdf-div max-sm:scale-110">
      <Document className='pdf-doc'
        file={pdfData}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page className='pdf-page'  height={350} renderTextLayer={false} pageNumber={pageNumber} devicePixelRatio={7} />
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


function ShopOrder({order, setOrder}){
    const fileInfo=order.fileInfo
    const [download,setDownload]=useState(false);

    async function downloadFiles(order){
        let files=order.files;
        let time=order.createdAt.split('T')[0];
        let token=order.tokenNumber;
        console.log("Download is: ",download);
        const response=await fetch(apiUrl+'/print/download',{
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
        link.download = `Order:${token} | Date:${time}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }

    async function singleDownload(file){
        // let files=order.files;
        // let time=order.createdAt.split('T')[0];
        // let token=order.tokenNumber;
        // console.log("Download is: ",download);
        const response=await fetch(apiUrl+"/print/single-download",{
        // const response=await fetch('http://localhost:5000/print/single-download',{
            method:'POST',
            // credentials:'include',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({file})
        })
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${file.originalname}`;
        // link.download = `Order:${token} | Date:${time}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }

    // useEffect(()=>{
    //     if(!download){
    //         setDownload(true);
    //         console.log("Hello")
    //         downloadFiles(order);
    //     }
    // },[])

    async function orderCompleted(){
      const response=await fetch(apiUrl+'/print/order-completed',{
            method:'POST',
            // credentials:'include',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({print: order._id, })
        })
        const data= await response.json();
        if(data.message){
          toast.error(data.message);
        }
        setOrder()
    }

    return(
        <>
        {/* <p className="cross-button" onClick={()=>{setOrder()}}>X</p> */}
        <main className="shop-order-main">
        <img alt="back" className="back-button" onClick={()=>{setOrder()}} src={backSign}/> 
        <div className="single-order-top">
          <div>
            <p>Order number</p>
            <p>{order.tokenNumber}</p>
          </div>
          <div>
            <p>Number of files</p>
            <p>{order.files.length}</p>
          </div>
          <div>
            <p>Amount received</p>
            <p>₹{order.totalPrice}</p>
          </div>
            <button onClick={()=>{downloadFiles(order)}}>Download all files</button>
        </div>
        <div className="order-files">
            {order.files.map((file,index)=>{
                return(
                    <div className="shop-order">
                        <div className="shop-details-container">
                          <PdfViewer file={file}/>
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
                              <p>{fileInfo[index].note==""?"none":fileInfo[index].note}</p>
                          </div>
                        </div>
                     </div>
                    <button className="download-button" onClick={()=>{singleDownload(file)}}>Download</button>
                  </div>
                )
            })}
        </div>
        {
          order.active &&
          <div onClick={()=>{orderCompleted()}} className="order-completed">Mark as completed</div>
        }
        </main>
        </>
    )
}

export {ShopOrder}
