import React from 'react';
import {Redirect} from 'react-router-dom';
import useAuth from './context/AuthContext';

import './Login.css';

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
