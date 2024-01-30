import { useEffect, useState } from "react"
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from "react-toastify";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({ pdfFile}) => {
    console.log(pdfFile)
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
  
    const onDocumentLoadSuccess = ({ numPages }) => {
      setNumPages(numPages);
    };
  
    return (
      <div className="pdf-div">
        <Document className='pdf-doc'
          file={"../../../server/uploads/prints/"+pdfFile.filename}
          onLoadSuccess={onDocumentLoadSuccess}
          onError={(err)=>{console.log("ERRRR: ",err)}}
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

function ShopOrder({order, setOrder}){
    // const {order}=order;
    console.log(order)
    const fileInfo=JSON.parse(order.fileInfo)
    console.log(fileInfo)
    const [download,setDownload]=useState(false);

    async function downloadFiles(order){
        let files=order.files;
        let time=order.createdAt.split('T')[0];
        let token=order.tokenNumber;
        console.log("Download is: ",download);
        const response=await fetch('http://localhost:5000/print/download',{
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
        const response=await fetch("http://localhost:5000/print/single-download",{
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
      const response=await fetch('http://localhost:5000/print/order-completed',{
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
        <p onClick={()=>{setOrder()}}>X</p>
        <main className="shop-order-main">
            Token number: {order.tokenNumber}
            Number of files: {order.files.length}
            Amout received: {order.totalPrice}
            <button onClick={()=>{downloadFiles(order)}}>Download all files</button>
            {order.files.map((file,index)=>{
                return(
                    <div className="" onClick={()=>{singleDownload(file)}}>
                        File name: {file.originalname}<br/>
                        Pages to be printed: {fileInfo[index].pageRange}<br/>
                        Color: {fileInfo[index].pageColor}<br/>
                        Method: {fileInfo[index].pageMethod}<br/>
                        Number of copies: {fileInfo[index].numberOfCopies}<br/>
                        Note: {fileInfo[index].note}<br/>
                        Price: {fileInfo[index].price}<br/>
                    </div>
                )
            })}
            <div onClick={()=>{orderCompleted()}}>Order completed</div>
        </main>
        </>
    )
}

export {ShopOrder}