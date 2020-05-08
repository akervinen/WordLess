import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import './TagList.css';

function Tag({tag}) {
  return <Link to={`/tags/${tag}`} className="tag">
    #{tag}
  </Link>;
}

export function TagList({inline, post}) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    (async function getTags() {
      if (post !== undefined) {
        setTags(post?.tags);
        return;
      }
      let response = await fetch('/api/tags');
      if (response.ok)
        setTags((await response.json()).map(t => t.name));
    })();
  }, [post]);

  return <ul className={inline ? 'inlineList' : 'tagList'}>
    {tags?.map(tag => <li key={tag}><Tag tag={tag}/></li>)}
  </ul>;
}
