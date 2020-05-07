import React, {Fragment, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useCookies} from 'react-cookie';
import './PostForm.css';

export default function PostForm(props) {
  const {id} = useParams();
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const {editPost, children} = props;
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);
  const [post, setPost] = useState({
    id: id,
    title: '',
    public: true,
    summary: '',
    content: ''
  });

  useEffect(() => {
    if (!id) return;
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      const data = result.ok ? await result.json() : {};
      setPost((prevState => {
        return {
          ...prevState,
          ...data
        };
      }));
    })();
  }, [id]);

  const submitUrl = editPost ? `/api/posts/${id}` : '/api/posts';
  const submitMethod = editPost ? 'PUT' : 'POST';

  useEffect(() => {
    (async function submitPost() {
      if (!shouldSubmit || submitted) return;
      setSubmitted(true);
      const response = await fetch(submitUrl, {
        method: submitMethod,
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': cookies['XSRF-TOKEN']
        },
        body: JSON.stringify(post)
      });
      setResponse(response);
    })();
  }, [submitUrl, submitMethod, shouldSubmit, submitted, post, cookies]);

  useEffect(() => {
    if (!response) return;
    if (response.status === 201) {
      let loc = response.headers.get('Location');
      let lastSlash = loc.lastIndexOf('/');
      let newId = Number(loc.substr(lastSlash + 1));
      setPost((prevState => {
        return {
          ...prevState,
          id: newId
        };
      }));
    }
  }, [response]);

  const onChange = function onChange(evt) {
    const target = evt.target;
    const value = target.name === 'public' ? target.checked : target.value;
    const name = target.name;
    setPost((prevState => {
      return {
        ...prevState,
        [name]: value
      };
    }));
  };

  const onSubmit = function onSubmit(evt) {
    evt.preventDefault();

    setShouldSubmit(true);
  };

  if (response && post.id)
    return <Fragment>{children(post, response)}</Fragment>;

  return <Fragment>
    <h2>{!id ? 'New Post' : 'Edit Post'}</h2>
    <form id="postForm" onSubmit={onSubmit.bind(this)}>
      <label>
        Title:
        <input name="title"
               type="text"
               placeholder="Enter title here"
               value={post.title}
               onChange={onChange}
               required
               maxLength={200}/>
      </label>
      <label id="publicLabel">
        Public:
        <input name="public"
               type="checkbox"
               checked={post['public']}
               onChange={onChange}/>
      </label>
      <label>
        Summary:
        <textarea name="summary"
                  placeholder="Enter post summary here"
                  required
                  value={post.summary}
                  onChange={onChange}/>
      </label>
      <label>
        Content:
        <textarea name="content"
                  placeholder="Enter post content here"
                  required
                  value={post.content}
                  onChange={onChange}/>
      </label>
      <input type="submit" value={!id ? 'Create' : 'Edit'}/>
    </form>
  </Fragment>;
}
