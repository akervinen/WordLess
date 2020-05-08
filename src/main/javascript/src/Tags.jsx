import React, {useContext, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {PostContext} from './PostContext';

import './Tags.css';

export function Tag({tag}) {
  return <Link to={`/tags/${tag}`} className="tag">
    #{tag}
  </Link>;
}

export function TagList(props) {
  const [tags, setTags] = useState([]);

  const [post] = useContext(PostContext);

  const {inline, postOnly} = props;

  useEffect(() => {
    (async function getTags() {
      if (post && postOnly) {
        setTags(post.tags);
        return;
      }
      let response = await fetch('/api/tags');
      if (response.ok)
        setTags((await response.json()).map(t => t.name));
    })();
  }, [post, postOnly]);

  return <ul className={inline ? 'inlineList' : 'tagList'}>
    {tags.map(tag => <li key={tag}><Tag tag={tag}/></li>)}
  </ul>;
}
