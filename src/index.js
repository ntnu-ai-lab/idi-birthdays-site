import * as ReactDOMClient from 'react-dom/client'
import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { EmailAuthProvider, } from "firebase/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import StyledFirebaseAuth from './StyledLogin';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const uiConfig = {
  signInSuccessUrl: '/dashboard',
  signInOptions: [EmailAuthProvider.PROVIDER_ID],
  callbacks: { signInSuccessWithAuthResult: () => false }
};

const Login = () => (
  <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
);


// sign out with redirect to / 
const Logout = () => {
  firebase.auth().signOut().then(() => {
    window.location.href = '/';
  }).catch((error) => {
    console.error(error);
  });
}

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
]);

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);
root.render(<RouterProvider router={router} />);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
