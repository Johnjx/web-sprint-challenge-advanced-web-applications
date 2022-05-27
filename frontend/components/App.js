import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import { axiosWithAuth } from '../axios'
import { AuthRoute } from './AuthRoute'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { /* ✨ implement */ }
  const redirectToArticles = () => { /* ✨ implement */ }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem('token')
    setMessage('Goodbye!')
    navigate('/')
  }

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(!spinnerOn)
    axiosWithAuth().post('/login', { username, password })
    .then(res => {
      localStorage.setItem('token', res.data.token)
      setMessage(res.data.message)
      setSpinnerOn(false)
      navigate('/articles')
    })
    .catch(err => console.log(err))
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(true)
    axiosWithAuth().get('/articles')
    .then(res => {
      setArticles(res.data.articles)
      setMessage(res.data.message)
      setSpinnerOn(false)
    })
    .catch(err => {
      console.log({err})
      setMessage('Ouch: jwt malformed')
      setSpinnerOn(false)
      navigate('/')
    })
  }

  const postArticle = article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setMessage('')
    setSpinnerOn(true)
    const newArticle = {
      title: article.title, 
      text: article.text, 
      topic: article.topic
    }
    axiosWithAuth().post('/articles', newArticle)
    .then(res => {
      setArticles(articles.concat(res.data.article))
      setMessage(res.data.message)
      setSpinnerOn(false)
    })
    .catch(err => {
      console.log({err})
      setMessage('Ouch: jwt malformed')
      setSpinnerOn(false)
      navigate('/')
    })
  }

  const updateArticle = ({ article_id, article }) => {
    // ✨ implement
    // You got this!
    const newArticle = {
      topic: article.topic,
      text: article.text, 
      title: article.title, 
    }
    setMessage('')
    setSpinnerOn(true)
    axiosWithAuth().put(`/articles/${article_id}`, newArticle)
    .then(res => {
      setArticles(articles.map(art => {
        if (art.article_id === currentArticleId) {
          return res.data.article
        } else {
          return art
        }
      }))
      setMessage(res.data.message)
      setSpinnerOn(false)
    })
    .catch(err => {
      console.log({err})
      setMessage('Ouch: jwt malformed')
      setSpinnerOn(false)
      navigate('/')
    })
  }

  const deleteArticle = article_id => {
    // ✨ implement
    setMessage('')
    setSpinnerOn(true)
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
    .then(res => {
      setArticles(articles.filter(art => art.article_id !== article_id))
      setMessage(res.data.message)
      setSpinnerOn(false)
    })
    .catch(err => {
      console.log({err})
      setMessage('Ouch: jwt malformed')
      setSpinnerOn(false)
      navigate('/')
    })
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner />
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route path="articles" element={
            <AuthRoute>
              <ArticleForm
              postArticle={postArticle}
              updateArticle={updateArticle}
              setCurrentArticleId={setCurrentArticleId} 
              currentArticle={articles.find(art => art.article_id === currentArticleId)}
              />
              <Articles
              articles={articles} 
              getArticles={getArticles} 
              deleteArticle={deleteArticle}
              currentArticleId={currentArticleId}
              setCurrentArticleId={setCurrentArticleId}
              />
            </AuthRoute>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
