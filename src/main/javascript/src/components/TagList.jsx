import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import './TagList.css';

/**
 * A tag that links to its page for browsing posts.
 * @param tag tag data
 * @returns {*} JSX for a Link with the tag name
 */
function Tag({tag}) {
  return <Link to={`/tags/${tag}`} className="tag">
    #{tag}
  </Link>;
}

/**
 * A list of tags, either all of them or one post's tags.
 * @param inline whether the list should be in a single line instead of multiple
 * @param post post data if showing post's tags
 * @returns {*} JSX for a list of tags
 */
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
