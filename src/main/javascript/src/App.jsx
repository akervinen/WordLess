import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Switch, useParams} from 'react-router-dom';
import './App.css';

function PostHeader(props) {
  const {post} = props;
  return (
    <header>
      <h1>
        <a href={`/posts/${post.id}/${post.slug}`}>{post.title}</a>
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
      <a href={`/posts/${post.id}/${post.slug}`}>Read More...</a>
    </footer>
  </article>);
}

function Post() {
  const {id} = useParams();
  const [post, setPost] = useState({});

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      const json = await result.json();
      setPost(json);
    })();
  }, []);

  return (
    <article>
      <PostHeader post={post}/>

      <div className="content">
        {post.content}
      </div>
    </article>);
}

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch('/api/posts');
      const json = await result.json();
      setPosts(json);
    })();
  }, []);

  return (
    <Fragment>
      {posts.map(item => (
        <PostSummary post={item}/>)
      )}
    </Fragment>);
}

function App() {
  return (
    <Router>
      <header>
        <h1>Spaghetti Forever</h1>
      </header>

      <main>
        <Switch>
          <Route path="/posts/:id" children={<Post/>}/>
          <Route path="/">
            <PostList/>
          </Route>
        </Switch>
      </main>
    </Router>
  );
}

export default App;
