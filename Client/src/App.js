import './App.css';
import { createBrowserRouter,RouterProvider } from 'react-router-dom';
import { Navbar } from './Components/Navbar';
import { Home } from './Components/Home';
import { Provider } from 'react-redux';
import { store } from './Redux';
import { SignIn } from './Components/SignIn';
import { SignUp } from './Components/SignUp';
import { SendFile } from './Components/SendFile';
import { ReceiveFile } from './Components/ReceiveFile';
import { PrintFile } from './Components/PrintFile';
import { BusnessSignUp } from './Components/BusinessSignUp';
import { ErrorPage } from './Components/ErrorPage';
import { BusinessSignIn } from './Components/BusinessSignIn';
import { ToastContainer } from 'react-toastify';
import { Orders } from './Components/Orders';
// import { SingleOrder } from './Components/SingleOrder';
// import { ShopOrder } from './Components/ShopOrder';


function App() {
  const router=createBrowserRouter([
    {
      path:"/",
      element:<Navbar/>,
      children:[
        {index:true, element:<Home/>},
        {path:"sign-in", element:<SignIn/>},
        {path:"sign-up", element:<SignUp/>},
        {path:"send-file", element:<SendFile/>},
        {path:"receive-file", element:<ReceiveFile/>},
        {path:"print-file", element:<PrintFile/>},
        {path:"business-sign-up", element:<BusnessSignUp/>},
        {path:"business-sign-in", element:<BusinessSignIn/>},
        {path:"orders", element:<Orders/>},
        // {path:"single-order", element:<SingleOrder/>},
        // {path:"shop-order", element:<ShopOrder/>},
      ],
      errorElement:<ErrorPage/>
    }
  ])

  return (
    <Provider store={store}>
        <ToastContainer 
            autoClose={2000}
        />
      <RouterProvider router={router}/>
    </Provider>
    );

  }

export default App;
