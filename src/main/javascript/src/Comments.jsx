import React, {useEffect, useState} from 'react';
import './Comments.css';

function Comment(props) {
  const {comment} = props;
  const posted = new Date(comment.postedTime);

  const onDelete = async function onDelete() {
    await fetch(`/api/posts/${comment.postId}/comments/${comment.id}`, {method: 'DELETE'});
    // TODO: do this in a more React way
    window.location.reload();
  }

  return <div className="comment">
    <header>
      <span className="commentAuthor">{comment.author}</span>
      <span>·</span>
      <time dateTime={posted.toISOString()}>{posted.toLocaleString()}</time>
      <span>·</span>
      <span className="commentControls">
        <button onClick={onDelete}>delete</button>
      </span>
    </header>

    <div>
      {comment.content}
    </div>
  </div>;
}

export function CommentForm(props) {
  const {postId} = props;

  const onSubmit = async function onSubmit(evt) {
    evt.preventDefault();

    const form = evt.currentTarget;

    const comment = {
      author: form.author.value,
      content: form.author.value
    };

    const resp = await fetch(`/api/posts/${postId}/comments`, {
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
  }

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
  </form>
}

export function CommentList(props) {
  const {postId} = props;

  const [state, setState] = useState({loading: true, comments: []});

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(`/api/posts/${postId}/comments`);
      setState({loading: false, comments: await result.json()});
    })();
  }, [postId]);

  if (state.loading)
    return null;

  if (state.comments.length === 0)
    return <h3>No comments yet.</h3>;

  return <div id="commentList">
    {state.comments.map(item => (
      <Comment key={item.id} comment={item}/>)
    )}
  </div>;
}