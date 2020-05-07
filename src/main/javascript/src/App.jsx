import React, {Fragment, useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams
} from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar';
import PostForm from './PostForm';
import {Post, PostHeader} from './Post';
import {TagList} from './Tags';
import SearchBar from './SearchBar';
import {useCookies} from 'react-cookie';

function PostSummary(props) {
  const {post} = props;
  return <article className="summaryBlock">
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PostList() {
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
      <Fragment>
        <PostSummary key={item.id} post={item}/>
        {idx < posts.length - 1 && <hr/>}
      </Fragment>)
    )}
  </Fragment>;
}

function PostControls() {
  const {id, slug} = useParams();
  const history = useHistory();
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const deletePost = async () => {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'X-XSRF-TOKEN': cookies['XSRF-TOKEN']
      }
    });
    if (response.ok)
      history.replace('/');
  };

  return <div id="controls">
    <Link to={`/posts/${!slug ? id : `${id}-${slug}`}/edit`}>Edit Post</Link>
    <button onClick={deletePost}>Delete Post</button>
  </div>;
}

function App() {
  return <Router>
    <header>
      <h1><Link to="/">Spaghetti Forever</Link></h1>
      <SearchBar/>
    </header>

    <div id="content">
      <main>
        <Switch>
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
        </Switch>
      </main>

      <Switch>
        <Route exact path="/posts/new"/>
        <Route path="/">
          <Sidebar>
            <Switch>
              <Route exact path="/posts/new"/>
              <Route path={['/posts/:id-:slug', '/posts/:id']}>
                <PostControls/>
              </Route>
              <Route path="/">
                <Link to="/posts/new">New Post</Link>
                <hr/>
                <div>
                  <h4>Tags</h4>
                  <TagList/>
                </div>
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
