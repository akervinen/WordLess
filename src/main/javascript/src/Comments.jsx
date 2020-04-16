import React, {useEffect, useState} from 'react';
import './Comments.css';

function Comment(props) {
  const {comment} = props;
  const posted = new Date(comment.postedTime);

  return <div className="comment">
    <header>
      <span className="author">{comment.author}</span> · <time
      dateTime={posted.toISOString()}>{posted.toLocaleString()}</time>
    </header>

    <div>
      {comment.content}
    </div>
  </div>;
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
    return <h2>No comments yet.</h2>;

  return <div id="commentList">
    {state.comments.map(item => (
      <Comment key={item.id} comment={item}/>)
    )}
  </div>;
}
