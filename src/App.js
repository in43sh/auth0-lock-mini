import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Auth0Lock from 'auth0-lock';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      secureDataResponse: null
    };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.fetchSecureData = this.fetchSecureData.bind(this);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.lock = null;
  }

  // DOUBLE CHECK THIS
  componentDidMount() {
    this.lock = new Auth0Lock(process.env.REACT_APP_AUTH0_CLIENT_ID, process.env.REACT_APP_AUTH0_DOMAIN);
    console.log(process.env.REACT_APP_AUTH0_CLIENT_ID);
    this.lock.on('authenticated', this.onAuthenticated);
    axios.get('/user-data').then(response => {
      this.setState({ user: response.data.user })
    });
  }

  onAuthenticated(authResult) {
    this.lock.getUserInfo(authResult.accessToken, (error, user) => {
      // user.sub (subject) is a user ID
      axios.post('/login', { userId: user.sub }).then(response => {
        this.setState({ user: response.data })
      })
    })
  }

  login() {
    this.lock.show();
  }

  logout() {
    axios.post('/logout').then(() => {
      this.setState({ user: null });
    });
  };

  getMessage = error => error.response
    ? error.response.data
      ? error.response.data.message
      : JSON.stringify(error.response.data, null, 2)
    : error.message;

  fetchSecureData() {
    axios.get('/secure-data').then(response => {
      this.setState({ secureDataResponse: JSON.stringify(response.data, null, 2) });
    }).catch(error => {
      this.setState({ secureDataResponse: this.getMessage(error) });
    })
  };

  render() {
    const { user, secureDataResponse } = this.state;
    const userData = JSON.stringify(user, null, 2);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          <div className="section">
            <button onClick={this.login}>Log in</button>
            {' '}
            <button onClick={this.logout}>Log out</button>
          </div>
          <div className="section">
            <h2>User data:</h2>
            <div><pre>{userData || 'null'}</pre></div>
          </div>
          <div className="section">
            <button onClick={this.fetchSecureData}>Fetch secure data</button>
            <div><pre>{secureDataResponse}</pre></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
