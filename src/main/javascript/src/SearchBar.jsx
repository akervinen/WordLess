import React from 'react';
import {useHistory} from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
  const history = useHistory();

  const onSubmit = async function (evt) {
    evt.preventDefault();

    const query = evt.currentTarget.query.value;

    history.push(`/search/?query=${query}`);
  };

  return <div id="search">
    <form onSubmit={onSubmit}>
      <input name="query" type="text" placeholder="Search..."/>
      <input type="submit" value="Search"/>
    </form>
  </div>;
}
