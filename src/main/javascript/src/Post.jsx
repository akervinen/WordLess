import {Link, useHistory, useLocation, useParams} from 'react-router-dom';
import React, {Fragment, useContext, useEffect, useState} from 'react';
import {useCookies} from 'react-cookie';
import ReactMarkdown from 'react-markdown';
import {CommentForm, CommentList} from './Comments';
import {PostContext} from './PostContext';

import './Post.css';

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

export function PostSummary(props) {
  const {post} = props;
  return <article className="summaryBlock">
    <PostHeader post={post}/>

    <div className="content">
      <ReactMarkdown source={post.summary}/>
    </div>

    <footer>
      <Link to={`/posts/${post.id}-${post.slug}`}>Read More...</Link>
      <span> · </span>
      <Link to={`/posts/${post.id}-${post.slug}#comments`}>
        {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
      </Link>
    </footer>
  </article>;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function PostList() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  const query = useQuery();
  const querySearch = query.get('query');
  const queryTag = query.get('tag');

  let url = '/api/posts';
  if (querySearch)
    url += `?query=${querySearch}`;
  if (queryTag)
    url += (querySearch ? '&' : '?') + `tag=${queryTag}`;

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(url);
      setLoading(false);
      setPosts(result.ok ? await result.json() : null);
    })();
  }, [url]);

  if (loading)
    return null;

  if (!Array.isArray(posts))
    return <h2>Error loading posts</h2>;

  if (!!querySearch && posts.length === 0)
    return <h2>No posts found</h2>;

  if (posts.length === 0)
    return <h2>No posts yet</h2>;

  return <Fragment>
    {posts.map((item, idx) => (
      <Fragment key={item.id}>
        <PostSummary post={item}/>
        {idx < posts.length - 1 && <hr/>}
      </Fragment>)
    )}
  </Fragment>;
}

export function PostControls() {
  const history = useHistory();
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const [post] = useContext(PostContext);

  const deletePost = async () => {
    const response = await fetch(`/api/posts/${post.id}`, {
      method: 'DELETE',
      headers: {
        'X-XSRF-TOKEN': cookies['XSRF-TOKEN']
      }
    });
    if (response.ok)
      history.replace('/');
  };

  return <div id="controls">
    <Link to={`/posts/${!post?.slug ? post?.id : `${post?.id}-${post?.slug}`}/edit`}>Edit Post</Link>
    <button onClick={deletePost}>Delete Post</button>
  </div>;
}

export function Post() {
  const {id} = useParams();
  const [loading, setLoading] = useState(true);

  const [post, setPost] = useContext(PostContext);

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      setLoading(false);
      setPost(result.ok ? await result.json() : null);
    })();
  }, [id, setPost]);

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
