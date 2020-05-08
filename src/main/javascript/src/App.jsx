import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Redirect, Route, Switch, useLocation, useParams} from 'react-router-dom';

import './App.css';

import {Post, PostControls, PostList} from './Post';
import PostForm from './PostForm';
import {TagList} from './Tags';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import {PostContext} from './context/PostContext';
import {LoginForm} from './Login';
import useAuth, {AuthContext} from './context/AuthContext';
import {useCookies} from 'react-cookie';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchPosts({query, tag}) {
  const [posts, setPosts] = useState(null);
  const tagName = useParams().tag;
  const queryParams = useQuery();

  let url = '/api/posts';
  if (query)
    url += `?query=${queryParams.get('query')}`;
  if (tag)
    url += (query ? '&' : '?') + `tag=${tagName}`;

  useEffect(() => {
    (async function fetchData() {
      const result = await fetch(url);
      setPosts(result.ok ? await result.json() : null);
    })();
  }, [url]);

  if (!posts) return null;

  return <PostList posts={posts}/>;
}

function PageNotFound() {
  return <h2>Page Not Found</h2>;
}

function MainContent({post}) {
  return <Switch>
    <PrivateRoute exact path="/posts/new">
      <PostForm>
        {(post) => <Redirect to={`/posts/${post.id}`}/>}
      </PostForm>
    </PrivateRoute>
    <PrivateRoute exact path={['/posts/:id-:slug/edit', '/posts/:id/edit']}>
      <PostForm editPost>
        {(post) => <Redirect to={`/posts/${post.id}`}/>}
      </PostForm>
    </PrivateRoute>
    <Route exact path={['/posts/:id-:slug', '/posts/:id']}>
      <Post post={post}/>
    </Route>
    <Route exact path="/login">
      <LoginForm/>
    </Route>
    <Route exact path="/search">
      <SearchPosts query/>
    </Route>
    <Route exact path="/tags/:tag">
      <SearchPosts tag/>
    </Route>
    <Route exact path="/">
      <SearchPosts/>
    </Route>
    <Route path="*">
      <PageNotFound/>
    </Route>
  </Switch>;
}

function SidebarContent({post}) {
  const [authed] = useAuth();

  if (post === undefined) {
    return <Fragment>
      {authed && <Fragment>
        <Link to="/posts/new">New Post</Link>
        <hr/>
      </Fragment>}
      <UserPanel/>
      <hr/>
      <div>
        <h4>All tags</h4>
        <TagList/>
      </div>
    </Fragment>;
  }

  return <Fragment>
    <PrivateFragment>
      <PostControls post={post}/>
      <hr/>
    </PrivateFragment>
    <UserPanel/>
    <hr/>
    <div>
      <h4>Post tags</h4>
      <TagList post={post}/>
    </div>
    <div>
      <h4>All tags</h4>
      <TagList/>
    </div>
  </Fragment>;
}

function PrivateFragment(props) {
  const [authed] = useAuth();
  return authed ? <Fragment {...props}/> : null;
}

function PrivateRoute(props) {
  const [authed] = useAuth();
  return authed ? <Route {...props} /> : <Redirect to="/"/>;
}

function UserPanel() {
  const [authed] = useAuth();

  if (authed)
    return <Link to="/logout">Log out</Link>;

  return <Link to="/login">Log in</Link>;
}

function App() {
  const [{jwt_authed}] = useCookies(['jwt_authed']);
  const [authed, setAuthed] = useState(jwt_authed === '1');
  const [post, setPost] = useState(null);

  return <Router>
    <AuthContext.Provider value={[authed, setAuthed]}>
      <PostContext.Provider value={[post, setPost]}>
        <header>
          <h1>
            <Link to="/">
              <img src={process.env.PUBLIC_URL + '/spaghetti.png'} alt="Spaghetti Forever logo"/>
              Spaghetti Forever
            </Link>
          </h1>
          <SearchBar/>
        </header>

        <div id="content">
          <main>
            <MainContent post={post}/>
          </main>

          <Switch>
            <PrivateRoute exact path="/posts/new"/>
            <Route exact path={['/posts/:id-:slug', '/posts/:id']}>
              <Sidebar>
                <SidebarContent post={post}/>
              </Sidebar>
            </Route>
            <Route path="/">
              <Sidebar>
                <SidebarContent/>
              </Sidebar>
            </Route>
          </Switch>
        </div>

        <footer>
          © Aleksi Kervinen 2020
        </footer>
      </PostContext.Provider>
    </AuthContext.Provider>
  </Router>;
}

export default App;
