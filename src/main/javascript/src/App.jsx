import React, {Fragment, useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Redirect, Route, Switch, useLocation, useParams} from 'react-router-dom';
import {useCookies} from 'react-cookie';

import './App.css';

import {PostContext} from './context/PostContext';
import useAuth, {AuthContext} from './context/AuthContext';

import {Post, PostControls, PostList} from './components/Post';
import PostForm from './components/PostForm';
import {TagList} from './components/TagList';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import {LoginForm, LogoutPage} from './components/Login';
import {PrivateFragment, PrivateRoute} from './components/Private';

/**
 * Hook to access query parameters easily.
 * @returns {URLSearchParams} query parameters
 */
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

/**
 * Queries the server for posts and shows them in a PostList.
 * @param query search query, or null
 * @param tag tag to filter by, or null
 * @returns {null|PostList} PostList with filtered posts, or null while the query is happening
 */
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

/**
 * Main content display.
 * @param post selected post, if any
 * @returns {*} Switch with Routes containing main content
 */
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
    <PrivateRoute exact path="/logout">
      <LogoutPage/>
    </PrivateRoute>
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
      <h2>Page Not Found</h2>
    </Route>
  </Switch>;
}

/**
 * Side bar contents, based on whether a singular post is selected or not.
 * @param post selected post data
 * @returns {*} Fragment with sidebar contents
 */
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

/**
 * Login or logout button based on authentication status.
 * @returns {*} Link to login/logout
 */
function UserPanel() {
  const [authed] = useAuth();

  if (authed)
    return <Link to="/logout">Log out</Link>;

  return <Link to="/login">Log in</Link>;
}

/**
 * Main app, contains everything.
 * @returns {Router} Router with the whole page contents
 */
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
