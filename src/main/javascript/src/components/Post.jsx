import {Link, Redirect, useParams} from 'react-router-dom';
import React, {Fragment, useContext, useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {CommentForm, CommentList} from './Comments';
import {PostContext} from '../context/PostContext';

import './Post.css';

/**
 * Post metadata as a header: title, posted time.
 *
 * @param post post data
 * @returns {*} JSX for a header
 */
export function PostHeader({post}) {
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

/**
 * Short summary of a post, containing header, summary and links to read more or comments.
 *
 * @param post post data
 * @returns {*} JSX for a summary element
 */
export function PostSummary({post}) {
  return <article className="summaryBlock">
    <PostHeader post={post}/>

    <div className="content">
      <ReactMarkdown source={post.summary}/>
    </div>

    <footer>
      <Link to={`/posts/${post.id}-${post.slug}`}>Read More...</Link>
      <span> · </span>
      <Link to={`/posts/${post.id}-${post.slug}#comments`}>
        {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
      </Link>
    </footer>
  </article>;
}

/**
 * List of posts.
 *
 * @param posts list of posts
 * @returns {*} JSX for a list of posts
 */
export function PostList({posts}) {
  if (!Array.isArray(posts) || posts.length === 0)
    return <h2>No posts found</h2>;

  return <Fragment>
    {posts.map((item, idx) => (
      <Fragment key={item.id}>
        <PostSummary post={item}/>
        {idx < posts.length - 1 && <hr/>}
      </Fragment>)
    )}
  </Fragment>;
}

/**
 * Admin controls for a post, like edit and delete buttons.
 *
 * @param post post data
 * @returns {*} JSX for control buttons
 */
export function PostControls({post}) {
  const [, setPost] = useContext(PostContext);

  const [deleteClicked, setDeleteClicked] = useState(false);

  const onClick = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setDeleteClicked(true);
    }
  };
  useEffect(() => {
    (async function deletePost() {
      if (!deleteClicked || !post) return;
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setPost(null);
      } else {
        setDeleteClicked(false);
      }
    })();
  }, [deleteClicked, post, setPost]);

  if (deleteClicked && !post) {
    return <Redirect to="/"/>;
  }

  if (!post || post === PostNotFound)
    return <div id="controls"/>;

  return <div id="controls">
    <Link to={`/posts/${`${post.id}-${post.slug}`}/edit`}>Edit Post</Link>
    <button onClick={onClick}>Delete Post</button>
  </div>;
}

/**
 * Placeholder empty object for 404 post data. Used to differentiate between "no post selected" and "post not found".
 * @type {{}}
 */
export const PostNotFound = {};

/**
 * Post component. Displays header, full summary + content and comments.
 * @returns {*} JSX for a post page
 */
export function Post() {
  const {id, slug} = useParams();

  const [post, setPost] = useContext(PostContext);

  useEffect(() => {
    (async function fetchData() {
      setPost(null);
      const result = await fetch(`/api/posts/${id}`);
      setPost(result.ok ? await result.json() : PostNotFound);
    })();
  }, [id, setPost]);

  if (post === null)
    return <article>
      <div className="content">
      </div>
    </article>;

  if (post === PostNotFound) {
    return <article>
      <div className="content">
        <h1>Post Not Found</h1>
      </div>
    </article>;
  }

  // Redirect to URL with slug if using an id-only URL.
  if (Number.parseInt(id) === post.id && slug !== post.slug)
    return <Redirect to={`/posts/${post.id}-${post.slug}`}/>;

  return <Fragment>
    <article>
      <PostHeader post={post}/>

      <div className="content">
        <ReactMarkdown source={post.summary}/>
        <ReactMarkdown source={post.content}/>
      </div>
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
