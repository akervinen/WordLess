import React, {useEffect} from 'react';
import {Redirect} from 'react-router-dom';
import useAuth from '../context/AuthContext';

import './Login.css';

/**
 * Logout page that just sends a POST request to remove cookies and redirects back to index.
 *
 * @returns {*} JSX with a logout message or redirection
 */
export function LogoutPage() {
  const [authed, setAuthed] = useAuth();

  useEffect(() => {
    if (!authed) return;
    (async function logout() {
      const response = await fetch(`/api/logout`, {
        method: 'POST'
      });
      if (response.ok)
        setAuthed(false);
    })();
  }, [authed, setAuthed]);

  if (!authed)
    return <Redirect to="/"/>;

  return <h2>Logging out...</h2>;
}

/**
 * Login form, sends a POST request for a JWT token on submit.
 *
 * Redirects to index if already authenticated.
 *
 * @returns {*} JSX for a login form
 */
export function LoginForm() {
  const [authed, setAuthed] = useAuth();

  if (authed)
    return <Redirect to="/"/>;

  const onSubmit = async function onSubmit(evt) {
    evt.preventDefault();

    const form = evt.currentTarget;

    const loginData = {
      username: form.username.value,
      password: form.password.value
    };

    const response = await fetch(`/api/auth`, {
      method: 'POST',
      body: new URLSearchParams(loginData)
    });

    if (response.ok)
      setAuthed(true);
    else
      setAuthed(false);
  };

  return <form id="loginForm" onSubmit={onSubmit}>
    <label>
      <span>Username:</span>
      <input name="username"
             type="text"
             required
             maxLength={100}/>
    </label>
    <label>
      <span>Password:</span>
      <input name="password"
             type="password"
             required
             maxLength={100}/>
    </label>
    <input type="submit" value="Login"/>
  </form>;
}
