import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState(null);

  const onSubmit = async function (evt) {
    evt.preventDefault();
    setQuery(evt.currentTarget.query.value);
  };

  if (query)
    return <Redirect to={`/search/?query=${query}`}/>;

  return <div id="search">
    <form onSubmit={onSubmit}>
      <input name="query" type="text" placeholder="Search..."/>
      <input type="submit" value="Search"/>
    </form>
  </div>;
}
