import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import '../App.css'
import error from '../Assets/error.jpg'
import '../Styles/error.css'


function ErrorPage() {

    const [imageLoaded, setImageLoaded] = useState(false);

    const navigate=useNavigate();    

    useEffect(() => {
        const image = new Image();
        image.src = error;

        image.onload = () => {
            setImageLoaded(true);
        };
    }, []);

    return (
        <>
            <main className="error-main">
                {!imageLoaded ? (
                    <div className="spinner-container">
                        <PulseLoader color="#333" loading={!imageLoaded} size={20} />
                    </div>
                ) : (
                    <>
                        <img
                            src={error}
                            alt="error"
                        />
                        <p className="error-text">You landed on the wrong page</p>
                        <p className="go-back-button" onClick={()=>{navigate(-1)}}>Go back</p>
                    </>
                )}
            </main>
        </>
    )
}

export { ErrorPage };