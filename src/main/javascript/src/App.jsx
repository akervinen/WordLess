import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch, useParams} from 'react-router-dom';
import './App.css';

function PostHeader(props) {
  const {post} = props;
  return (
    <header>
      <h1>
        <Link to={`/posts/${post.id}/${post.slug}`}>{post.title}</Link>
      </h1>
      <p className="meta">
        <time dateTime={post.postedTime}>{new Date(post.postedTime).toLocaleString()}</time>
      </p>
    </header>);
}

function PostSummary(props) {
  const {post} = props;
  return (<article>
    <PostHeader post={post}/>

    <div className="summary">
      {post.summary}
    </div>

    <footer>
      <Link to={`/posts/${post.id}/${post.slug}`}>Read More...</Link>
    </footer>
  </article>);
}

function PostNotFound() {
  return (<h1>Post Not Found</h1>);
}

function Post(props) {
  const {onDelete, history} = props;
  const {id} = useParams();
  const [post, setPost] = useState({});

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      setPost(result.ok ? await result.json() : null);
    })();
  }, [id]);

  if (post === null) {
    return <article>
      <div className="content">
        <PostNotFound/>
      </div>
    </article>;
  }

  return (
    <article>
      <PostHeader post={post}/>

      <div className="content">
        {post.content}
      </div>

      <footer>
        <button onClick={onDelete.bind(null, id, history)}>Delete</button>
      </footer>
    </article>);
}

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch('/api/posts');
      setPosts(await result.json());
    })();
  }, []);

  if (posts.length === 0)
    return <h2>No Posts Yet</h2>;

  return (
    <Fragment>
      {posts.map(item => (
        <PostSummary key={item.id} post={item}/>)
      )}
    </Fragment>);
}

async function deletePost(id, history) {
  await fetch(`/api/posts/${id}`, {method: 'DELETE'});
  history.replace('/');
}

function App() {
  return (
    <Router>
      <header>
        <h1><Link to="/">Spaghetti Forever</Link></h1>
      </header>

      <main>
        <Switch>
          <Route path="/posts/:id" render={props => <Post onDelete={deletePost} {...props}/>}/>
          <Route path="/">
            <PostList/>
          </Route>
        </Switch>
      </main>
    </Router>
  );
}

export default App;
