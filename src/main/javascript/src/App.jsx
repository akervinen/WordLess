import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch, useParams} from 'react-router-dom';
import './App.css';
import Sidebar from "./Sidebar";

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

function Post() {
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
  const {id} = useParams();
  const {onSubmit, history} = props;
  const [state, setState] = useState({
    title: "",
    public: true,
    summary: "",
    content: ""
  });

  useEffect(() => {
    if (!id) return;
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      const data = result.ok ? await result.json() : {};
      setState((prevState => {
        return {
          ...prevState,
          ...data
        }
      }));
    })();
  }, [id]);

  const onChange = function onChange(evt) {
    const target = evt.target;
    const value = target.name === 'public' ? target.checked : target.value;
    const name = target.name;
    setState((prevState => {
      return {
        ...prevState,
        [name]: value
      }
    }));
  };

  return (
    <Fragment>
      <h1>{!id ? "New Post" : "Edit Post"}</h1>
      <form id="postForm" onSubmit={onSubmit.bind(null, state, history)}>
        <label>
          Title:
          <input name="title"
                 type="text"
                 placeholder="Enter title here"
                 value={state.title}
                 onChange={onChange}
                 required
                 maxLength={200}/>
        </label>
        <label id="publicLabel">
          Public:
          <input name="public"
                 type="checkbox"
                 checked={state['public']}
                 onChange={onChange}/>
        </label>
        <label>
          Summary:
          <textarea name="summary"
                    placeholder="Enter post summary here"
                    required
                    value={state.summary}
                    onChange={onChange}/>
        </label>
        <label>
          Content:
          <textarea name="content"
                    placeholder="Enter post content here"
                    required
                    value={state.content}
                    onChange={onChange}/>
        </label>
        <input type="submit" value={!id ? 'Create' : 'Edit'}/>
      </form>
    </Fragment>);
}

function PostControls(props) {
  const {onDelete, history} = props;
  const {id} = useParams();

  return (<div id="controls">
    <Link to={`/posts/${id}/edit`}>Edit Post</Link>
    <button onClick={onDelete.bind(null, id, history)}>Delete Post</button>
  </div>);
}

async function submitNewPost(state, history, evt) {
  evt.preventDefault();

  const resp = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state)
  });

  if (resp.status === 201) {
    let loc = resp.headers.get('Location');
    let lastSlash = loc.lastIndexOf('/');
    let id = Number(loc.substr(lastSlash + 1));

    history.push(`/posts/${id}`);
  }
}

async function editPost(state, history, evt) {
  evt.preventDefault();

  const resp = await fetch(`/api/posts/${state.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state)
  });

  if (resp.status === 204) {
    history.push(`/posts/${state.id}`);
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

      <div id="content">
        <main>
          <Switch>
            <Route exact path="/posts/new" render={props => <PostForm onSubmit={submitNewPost} {...props}/>}/>
            <Route exact path="/posts/:id/edit" render={props => <PostForm onSubmit={editPost} {...props}/>}/>
            <Route path="/posts/:id">
              <Post/>
            </Route>
            <Route path="/">
              <PostList/>
            </Route>
          </Switch>
        </main>

        <Switch>
          <Route exact path="/posts/new"/>
          <Route path="/">
            <Sidebar>
              <Switch>
                <Route exact path="/posts/new"/>
                <Route path="/posts/:id" render={props => <PostControls onDelete={deletePost} {...props}/>}/>
                <Route path="/">
                  <Link to="/posts/new">New Post</Link>
                </Route>
              </Switch>
            </Sidebar>
          </Route>
        </Switch>
      </div>

      <footer>
        © Aleksi Kervinen 2020
      </footer>
    </Router>
  );
}

export default App;
