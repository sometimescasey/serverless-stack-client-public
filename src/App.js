import React, {useState, useEffect } from 'react';
import { Auth } from "aws-amplify";
import './App.css';
import TopNav from './components/TopNav';
import ErrorBoundary from './components/ErrorBoundary';
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { onError } from "./libs/errorLib";

function App() {
  const [ isAuthenticating, setIsAuthenticating ] = useState(true);
  const [ isAuthenticated, setIsAuthenticated ] = useState(false);

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      await Auth.currentSession();
      setIsAuthenticated(true);
    }
    catch (e) {
      if (e !== 'No current user') {
        onError(e);
      }
    }

    setIsAuthenticating(false);
  }

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        { !isAuthenticating &&
          <div className="App container">
            <TopNav />
            <Routes />
          </div>
        }
      </AppContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
