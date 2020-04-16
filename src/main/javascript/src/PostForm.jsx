import {useParams} from 'react-router-dom';
import React, {Fragment, useEffect, useState} from 'react';
import './PostForm.css'

export default function PostForm(props) {
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
      <h2>{!id ? "New Post" : "Edit Post"}</h2>
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
