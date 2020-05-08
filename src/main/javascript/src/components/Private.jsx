import React, {Fragment} from 'react';
import {Redirect, Route} from 'react-router-dom';
import useAuth from '../context/AuthContext';

export function PrivateFragment(props) {
  const [authed] = useAuth();
  return authed ? <Fragment {...props}/> : null;
}

export function PrivateRoute(props) {
  const [authed] = useAuth();
  return authed ? <Route {...props} /> : <Redirect to="/"/>;
}
