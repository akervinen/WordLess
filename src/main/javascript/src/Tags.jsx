import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import './Tags.css';

export function Tag(props) {
  const {tag} = props;
  return <Link to={`/search/?tag=${tag.name}`} className="tag">
    #{tag.name}
  </Link>;
}

export function PostTagList(props) {
  const {inline, post} = props;

  return <ul className={inline ? 'inlineList' : 'tagList'}>
    {post.tags.map(tag => <li><Tag tag={tag}/></li>)}
  </ul>;
}

export function TagList(props) {
  const [tags, setTags] = useState([]);

  const {inline} = props;

  useEffect(() => {
    (async function getTags() {
      let response = await fetch('/api/tags');
      if (response.ok)
        setTags(await response.json());
    })();
  });

  return <ul className={inline ? 'inlineList' : 'tagList'}>
    {tags.map(tag => <li><Tag tag={tag}/></li>)}
  </ul>;
}
