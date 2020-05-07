import {Link, useParams} from 'react-router-dom';
import React, {Fragment, useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {CommentForm, CommentList} from './Comments';
import './Post.css';
import {TagList} from './Tags';

export function PostHeader(props) {
  const {post} = props;
  const posted = new Date(post.postedTime);
  return <header>
    <h1>
      <Link to={`/posts/${post.id}-${post.slug}`}>{post.title}</Link>
    </h1>
    <p className="meta">
      <time dateTime={posted.toISOString()}>{posted.toLocaleString()}</time>
    </p>
  </header>;
}

export function Post() {
  const {id} = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      setLoading(false);
      setPost(result.ok ? await result.json() : null);
    })();
  }, [id]);

  if (loading)
    return <article>
      <div className="content">
      </div>
    </article>;

  if (post === null) {
    return <article>
      <div className="content">
        <h1>Post Not Found</h1>
      </div>
    </article>;
  }

  return <Fragment>
    <article>
      <PostHeader post={post}/>

      <div className="content">
        <ReactMarkdown source={post.summary}/>
        <ReactMarkdown source={post.content}/>
      </div>

      <footer>
        {post?.tags?.length > 0 &&
        <div>Tags: <TagList inline post={post}/></div>}
      </footer>
    </article>

    <hr/>

    <section id="comments">
      <h2>Comments</h2>
      <CommentList post={post}/>

      <hr/>

      {post.locked
        ? <h3>Comments locked</h3>
        : <Fragment><h3>New Comment</h3>
          <CommentForm post={post}/></Fragment>}
    </section>
  </Fragment>;
}
