import React from 'react';
import ReactMarkdown from 'react-markdown';
import './Comments.css';
import {PrivateFragment} from './Private';

/**
 * Comment component with metadata and content display, and controls for admins (delete button).
 *
 * @param comment comment data
 * @returns {*} JSX for the comment box
 */
function Comment({comment}) {
  const posted = new Date(comment.postedTime);

  const onDelete = async function onDelete() {
    await fetch(`/api/posts/${comment.postId}/comments/${comment.id}`, {
      method: 'DELETE'
    });
    // TODO: do this in a more React way
    window.location.reload();
  };

  return <div className="comment">
    <header>
      <span className="commentAuthor">{comment.author}</span>
      <span>·</span>
      <time dateTime={posted.toISOString()}>{posted.toLocaleString()}</time>
      <PrivateFragment>
        <span>·</span>
        <span className="commentControls">
          <button onClick={onDelete}>delete</button>
        </span>
      </PrivateFragment>
    </header>

    <div>
      <ReactMarkdown source={comment.content}/>
    </div>
  </div>;
}

/**
 * Comment form for posting new comments.
 *
 * @param post post data the comment will be posted under
 * @returns {*} JSX for the comment form
 */
export function CommentForm({post}) {
  const onSubmit = async function onSubmit(evt) {
    evt.preventDefault();

    const form = evt.currentTarget;

    const comment = {
      author: form.author.value,
      content: form.content.value
    };

    const resp = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    });

    if (resp.status === 201) {
      // TODO: do this in a more React way
      window.location.reload();
    }
  };

  if (!post)
    return <h3>Loading...</h3>;

  if (post.locked)
    return <h3>Comments locked</h3>;

  return <form id="commentForm" onSubmit={onSubmit}>
    <label>
      Author:
      <input name="author"
             type="text"
             required
             maxLength={100}/>
    </label>
    <label>
      Comment:
      <textarea name="content"
                required/>
    </label>
    <input type="submit" value="Post Comment"/>
  </form>;
}

/**
 * List of comments in a post.
 *
 * @param post post containing the comments
 * @returns {*} JSX for all comments in a list
 */
export function CommentList({post}) {
  if (!post)
    return <h3>Loading...</h3>;

  if (!Array.isArray(post.comments))
    return <h3>Error loading comments</h3>;

  if (post.comments.length === 0)
    return <h3>No comments yet.</h3>;

  return <div id="commentList">
    {post.comments.map(item => (
      <Comment key={item.id} comment={item}/>)
    )}
  </div>;
}
