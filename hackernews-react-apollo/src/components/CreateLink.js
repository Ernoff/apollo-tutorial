import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { LINKS_PER_PAGE, GC_USER_ID } from './constants'
import { FEED_QUERY } from './LinkList'

class CreateLink extends Component {
  state = {
    description: '',
    url: ''
  }

  render(){
    return (
      <div>
        <div className='flex flex-column mt3'>
          <input 
            className='mb2'
            value={this.state.description}
            onChange={(e) => this.setState({description: e.target.value })}
            type='text'
            placeholder='A description for the link'
            />
          <input 
            className='mb2'
            value={this.state.url}
            onChange={(e) => this.setState({ url: e.target.value })}
            type='text'
            placeholder='The URL for the link'
          />
        </div>
        <button onClick={() => this._createLink()}>
          Submit
        </button>
      </div>
    )
  }

  _createLink = async () => {
    try {
      const postedById = localStorage.getItem(GC_USER_ID)
      if (!postedById) {
        console.error("No User logged in");
        return;
      }
      const {description, url } = this.state
      await this.props.createLinkMutation({
        variables: {
          description,
          url,
          postedById
        },
        update: (store, { data: { post }}) => {
          const first = LINKS_PER_PAGE
          const skip = 0
          const orderBy = 'createdAt_DESC'
          const data = store.readQuery({ 
            query: FEED_QUERY,
            variables: {first, skip, orderBy }, 
          })
          data.feed.links.splice(0,0, post)
          data.feed.links.pop()
          store.writeQuery({
            query: FEED_QUERY,
            data,
            variables: { first, skip, orderBy },
          })
        },
      })
    this.props.history.push('/new/1')

    } catch (e) {
      console.log(e)
    }
   } 
}
// 
const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation(
    $description: String!
    $url: String!
    $postedById: ID!
  ) {
    createLink(description: $description, url: $url, postedById: $postedById) {
      id
      url
      createdAt
      description
      postedBy {
        id
        email
      }
    }
  }
`;

export default graphql(CREATE_LINK_MUTATION, {name: 'createLinkMutation'})(CreateLink)