import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo'
import { ApolloCliennt } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-memory'

const httpLink = new HttpLink({uri: '__SIMPLE_API_ENDPOINT__'})

const client = new ApolloCliennt({
  link: httpLink,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ApolloProvider client={client}>
  <App />
  </ApolloProvider>
  , document.getElementById('root'));
registerServiceWorker();
