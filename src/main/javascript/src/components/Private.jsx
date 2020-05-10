import React, {Fragment} from 'react';
import {Redirect, Route} from 'react-router-dom';
import useAuth from '../context/AuthContext';

/**
 * Fragment that is only displayed when the user is authenticated. Passes all props to the fragment.
 * @param props props to pass to the Fragment
 * @returns {*} Fragment or null if unauthorized
 */
export function PrivateFragment(props) {
  const [authed] = useAuth();
  return authed ? <Fragment {...props}/> : null;
}

/**
 * Route that is only displayed to authenticated users, otherwise it redirects back to index. Props are passed to the Route.
 * @param children child components
 * @param rest other props
 * * @returns {*} Route that either shows the child components or redirects unauthenticated users to index
 */
export function PrivateRoute({children, ...rest}) {
  const [authed] = useAuth();
  return <Route {...rest}>
    {authed ? children : <Redirect to="/"/>}
  </Route>;
}
