import React, {Fragment, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import './PostForm.css';

function tagsToString(tags) {
  return tags?.join(' ');
}

function stringToTags(str) {
  return str?.split(/\s+/);
}

export default function PostForm({editPost, children}) {
  const {id} = useParams();

  // If true, submit was clicked but no form was sent yet
  const [shouldSubmit, setShouldSubmit] = useState(false);
  // Once form is sent, this is true
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);
  const [postData, setPostData] = useState({
    id: id,
    title: '',
    public: true,
    locked: false,
    summary: '',
    content: '',
    tags: []
  });

  //
  useEffect(() => {
    if (!id) return;
    (async function fetchData() {
      const result = await fetch(`/api/posts/${id}`);
      const data = result.ok ? await result.json() : {};
      // Only overwrite existing properties, don't create new ones.
      // This is to avoid getting unneeded properties in state, like post comments.
      setPostData((prevState => {
        let newState = Object.assign({}, prevState);
        for (const prop in prevState) {
          newState[prop] = data[prop];
        }
        return newState;
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      setResponse(response);
    })();
  }, [submitUrl, submitMethod, shouldSubmit, submitted, postData]);

  // This useEffect grabs the Location header and finds the new
  // post id from it.
  useEffect(() => {
    if (!response) return;
    if (response.status === 201) {
      let loc = response.headers.get('Location');
      let lastSlash = loc.lastIndexOf('/');
      let newId = Number(loc.substr(lastSlash + 1));
      setPostData((prevState => {
        return {
          ...prevState,
          id: newId
        };
      }));
    }
  }, [response]);

  const onChange = function onChange(evt) {
    const target = evt.target;
    let value = target.value;
    if (target.name === 'tags')
      value = stringToTags(target.value);
    if (target.type === 'checkbox')
      value = target.checked;
    const name = target.name;
    setPostData((prevState => {
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

  if (response && postData.id)
    return <Fragment>{children(postData, response)}</Fragment>;

  return <Fragment>
    <h2>{!id ? 'New Post' : 'Edit Post'}</h2>
    <form id="postForm" onSubmit={onSubmit.bind(this)}>
      <label>
        Title:
        <input name="title"
               type="text"
               placeholder="Enter title here"
               value={postData.title}
               onChange={onChange}
               required
               maxLength={200}/>
      </label>
      <label className="singleLine">
        Public:
        <input name="public"
               type="checkbox"
               checked={postData['public']}
               onChange={onChange}/>
      </label>
      <label className="singleLine">
        Locked:
        <input name="locked"
               type="checkbox"
               checked={postData.locked}
               onChange={onChange}/>
      </label>
      <label>
        Tags, separate by spaces:
        <input name="tags"
               type="text"
               placeholder="List of tags, separated by spaces"
               value={tagsToString(postData.tags)}
               onChange={onChange}/>
      </label>
      <label>
        Summary:
        <textarea name="summary"
                  placeholder="Enter post summary here"
                  required
                  value={postData.summary}
                  onChange={onChange}/>
      </label>
      <label>
        Content:
        <textarea name="content"
                  placeholder="Enter post content here"
                  required
                  value={postData.content}
                  onChange={onChange}/>
      </label>
      <input type="submit" value={!id ? 'Create' : 'Edit'}/>
    </form>
  </Fragment>;
}
