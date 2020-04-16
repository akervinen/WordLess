import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch, useHistory, useParams} from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar';
import PostForm from './PostForm';
import {Post, PostHeader} from './Post';

function PostSummary(props) {
  const {post} = props;
  return <article>
    <PostHeader post={post}/>

    <div className="summary">
      {post.summary}
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

  return <Fragment>
    {state.posts.map(item => (
      <PostSummary key={item.id} post={item}/>)
    )}
  </Fragment>;
}

function PostControls(props) {
  const {onDelete} = props;
  const {id, slug} = useParams();
  const history = useHistory();

  return <div id="controls">
    <Link to={`/posts/${!slug ? id : `${id}-${slug}`}/edit`}>Edit Post</Link>
    <button onClick={onDelete.bind(null, id, history)}>Delete Post</button>
  </div>;
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
  return <Router>
    <header>
      <h1><Link to="/">Spaghetti Forever</Link></h1>
    </header>

    <div id="content">
      <main>
        <Switch>
          <Route exact path="/posts/new">
            <PostForm onSubmit={submitNewPost}/>
          </Route>
          <Route path={["/posts/:id-:slug/edit", "/posts/:id/edit"]}>
            <PostForm onSubmit={editPost}/>
          </Route>
          <Route path={["/posts/:id-:slug", "/posts/:id"]}>
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
              <Route path={["/posts/:id-:slug", "/posts/:id"]}>
                <PostControls onDelete={deletePost}/>
              </Route>
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
  </Router>;
}

export default App;
