import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import './Tags.css';

export function Tag(props) {
  const {tag} = props;
  return <Link to={`/search/?tag=${tag}`} className="tag">
    #{tag}
  </Link>;
}

export function TagList(props) {
  const [tags, setTags] = useState([]);

  const {inline, post} = props;

  useEffect(() => {
    (async function getTags() {
      if (post) {
        setTags(post.tags);
        return;
      }
      let response = await fetch('/api/tags');
      if (response.ok)
        setTags((await response.json()).map(t => t.name));
    })();
  }, [post]);

  return <ul className={inline ? 'inlineList' : 'tagList'}>
    {tags.map(tag => <li key={tag}><Tag tag={tag}/></li>)}
  </ul>;
}
