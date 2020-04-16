import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch, useParams} from 'react-router-dom';
import './App.css';

function PostHeader(props) {
  const {post} = props;
  const posted = new Date(post.postedTime);
  return (
    <header>
      <h2>
        <Link to={`/posts/${post.id}/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="meta">
        <time dateTime={posted.toISOString()}>{posted.toLocaleString()}</time>
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
    return null;

  if (state.post === null) {
    return <article>
      <div className="content">
        <PostNotFound/>
      </div>
    </article>;
  }

  return (
    <article>
      <PostHeader post={state.post}/>

      <div className="content">
        {state.post.content}
      </div>

      <footer>
        <button onClick={onDelete.bind(null, id, history)}>Delete</button>
      </footer>
    </article>);
}

function PostList() {
  const [state, setState] = useState({loading: true, posts: []});

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch('/api/posts');
      setState({loading: false, posts: await result.json()});
    })();
  }, []);

  if (state.loading)
    return null;

  if (state.posts.length === 0)
    return <h2>No Posts Yet</h2>;

  return (
    <Fragment>
      {state.posts.map(item => (
        <PostSummary key={item.id} post={item}/>)
      )}
    </Fragment>);
}

function PostForm(props) {
  const {onSubmit, post, history} = props;

  return (
    <Fragment>
      <h1>{!post ? "New Post" : "Edit Post"}</h1>
      <form id="postForm" onSubmit={onSubmit.bind(null, history)}>
        <label>
          Title:
          <input type="text" name="title" placeholder="Enter title here" required maxLength={200}/>
        </label>
        <label id="publicLabel">
          Public:
          <input type="checkbox" name="public" defaultChecked={true}/>
        </label>
        <label>
          Summary:
          <textarea name="summary" placeholder="Enter post summary here" required/>
        </label>
        <label>
          Content:
          <textarea name="content" placeholder="Enter post content here" required/>
        </label>
        <input type="submit" value="Create"/>
      </form>
    </Fragment>);
}

async function submitNewPost(history, evt) {
  evt.preventDefault();

  const form = evt.currentTarget;
  const post = {
    title: form.title.value,
    summary: form.summary.value,
    content: form.content.value
  };

  const resp = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(post)
  });

  if (resp.status === 201) {
    let loc = resp.headers.get('Location');
    let lastSlash = loc.lastIndexOf('/');
    let id = Number(loc.substr(lastSlash + 1));

    history.push('/posts/' + id);
  }
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
          <Route path="/posts/new" render={props => <PostForm onSubmit={submitNewPost} {...props}/>}/>
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
