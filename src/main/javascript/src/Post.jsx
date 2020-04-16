import {Link, useParams} from 'react-router-dom';
import React, {Fragment, useEffect, useState} from 'react';
import {CommentList} from './Comments';

export function PostHeader(props) {
  const {post} = props;
  const posted = new Date(post.postedTime);
  return (
    <header>
      <h2>
        <Link to={`/posts/${post.id}-${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="meta">
        <time dateTime={posted.toISOString()}>{posted.toLocaleString()}</time>
      </p>
    </header>);
}

export function Post() {
  const {id} = useParams();
  const [state, setState] = useState({loading: true, post: null});

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      setState({
        loading: false,
        post: (result.ok ? await result.json() : null)
      });
    })();
  }, [id]);

  if (state.loading)
    return <article>
      <div className="content">
      </div>
    </article>;

  if (state.post === null) {
    return <article>
      <div className="content">
        <h1>Post Not Found</h1>
      </div>
    </article>;
  }

  return <Fragment>
    <article>
      <PostHeader post={state.post}/>

      <div className="content">
        {state.post.content}
      </div>

      <footer>
      </footer>
    </article>

    <section className="comments">
      <h2>Comments</h2>
      <CommentList postId={id}/>
    </section>
  </Fragment>;
}
