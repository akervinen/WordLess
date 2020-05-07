import React, {useState} from 'react';
import {BrowserRouter as Router, Link, Redirect, Route, Switch} from 'react-router-dom';

import './App.css';

import {Post, PostControls, PostList} from './Post';
import PostForm from './PostForm';
import {TagList} from './Tags';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import {PostContext} from './PostContext';

function MainContent() {
  return <Switch>
    <Route path="/search">
      <PostList/>
    </Route>
    <Route exact path="/posts/new">
      <PostForm>
        {(post) => <Redirect to={`/posts/${post.id}`}/>}
      </PostForm>
    </Route>
    <Route path={['/posts/:id-:slug/edit', '/posts/:id/edit']}>
      <PostForm editPost>
        {(post) => <Redirect to={`/posts/${post.id}`}/>}
      </PostForm>
    </Route>
    <Route path={['/posts/:id-:slug', '/posts/:id']}>
      <Post/>
    </Route>
    <Route path="/">
      <PostList/>
    </Route>
  </Switch>;
}

function SidebarContent() {
  return <Switch>
    <Route exact path="/posts/new"/>
    <Route path={['/posts/:id-:slug', '/posts/:id']}>
      <PostControls/>
      <hr/>
      <div>
        <h4>Post tags</h4>
        <TagList postOnly/>
      </div>
      <div>
        <h4>All tags</h4>
        <TagList/>
      </div>
    </Route>
    <Route path="/">
      <Link to="/posts/new">New Post</Link>
      <hr/>
      <div>
        <h4>All tags</h4>
        <TagList/>
      </div>
    </Route>
  </Switch>;
}

function App() {
  const [post, setPost] = useState(null);
  return <PostContext.Provider value={[post, setPost]}>
    <Router>
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
          <MainContent/>
        </main>

        <Switch>
          <Route exact path="/posts/new"/>
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
    </Router>
  </PostContext.Provider>;
}

export default App;
