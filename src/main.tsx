import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorPage, App, Doll, DollsListing, loadDoll, loadDolls } from './App.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { 
        path: "/", 
        element: <DollsListing />, 
        loader: loadDolls },
      {
        path: "dolls/:id",
        element: <Doll />,
        // @ts-ignore
        loader: loadDoll,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
