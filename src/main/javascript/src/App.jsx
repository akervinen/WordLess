import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Link, Redirect, Route, Switch, useLocation, useParams} from 'react-router-dom';

import './App.css';

import {Post, PostControls, PostList} from './Post';
import PostForm from './PostForm';
import {TagList} from './Tags';
import SearchBar from './SearchBar';
import Sidebar from './Sidebar';
import {PostContext} from './PostContext';

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

function MainContent(props) {
  const {post} = props;
  return <Switch>
    <Route path="/search">
      <SearchPosts query/>
    </Route>
    <Route path="/tags/:tag">
      <SearchPosts tag/>
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
      <Post post={post}/>
    </Route>
    <Route path="/">
      <SearchPosts/>
    </Route>
  </Switch>;
}

function SidebarContent(props) {
  const {post} = props;
  return <Switch>
    <Route exact path="/posts/new"/>
    <Route path={['/posts/:id-:slug', '/posts/:id']}>
      <PostControls post={post}/>
      <hr/>
      <div>
        <h4>Post tags</h4>
        <TagList post={post}/>
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
