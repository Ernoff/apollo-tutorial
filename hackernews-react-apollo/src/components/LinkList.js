import React, { Component } from 'react'
import Link from './Link'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { LINKS_PER_PAGE } from './constants'

class LinkList extends Component {
  
  componentDidMount(){
    this._subscribeToNewLinks()
    this._subscribeToNewVotes()
  }

  render(){

    if (this.props.feedQuery && this.props.feedQuery.loading){
      return <div>Loading</div>
    }

    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>
    }

    const isNewPage = this.props.location.pathname.includes('new')
    
    const linksToRender = this._getLinksToRender(isNewPage)
    const page = parseInt(this.props.match.params.page, 10)
  //   const linksToRender = [{
  //     id: '1',
  //     description: 'The coolest GraphQl Backend :)',
  //     url: 'https://www.graph.cool'
  //   }, {
  //     id: '2',
  //     description: 'The Best GraphQL Client',
  //     url: 'http://dev.apollodata.com/'
  //   }]
    
    
    return <div>
        <div>
          {linksToRender.map((link, index) => (
            <Link
              key={link.id}
              index={page ? (page - 1) * LINKS_PER_PAGE + index : index}
              updateStoreAfterVote={this._updateCacheAfterVote}
              link={link}
            />
          ))}
        </div>
        {isNewPage && <div className="flex ml4 mv3 gray">
            <div className="pointer mr2" onClick={() => this._previousPage()}>
              Previous
            </div>
            <div className="pointer" onClick={() => this._nextPage()}>
              Next
            </div>
          </div>
        }
      </div>
  }

  _getLinksToRender = (isNewPage) => {
    if(isNewPage){
      return this.props.feedQuery.allLinks
    }
    const rankedLinks = this.props.feedQuery.allLinks.slice()
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length)
    console.log(rankedLinks)
    return rankedLinks
  }

  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if(page <= this.props.feedQuery._allLinksMeta.count / LINKS_PER_PAGE){
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if(page > 1){
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)
    const skip = isNewPage ? (page - 1 ) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    const data = store.readQuery({ query: FEED_QUERY, variables: {first, skip, orderBy}})

    const votedLink = data.allLinks.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({ query: FEED_QUERY, data })
  }


  _subscribeToNewVotes = () => {
    this.props.feedQuery.subscribeToMore({ document: gql`
        subscription {
          Vote(filter: { mutation_in: [CREATED] }) {
            node {
              id
              link {
                id
                url
                description
                createdAt
                postedBy {
                  id
                }
                votes {
                  id
                  user {
                    id
                  }
                }
              }
              user {
                id
              }
            }
          }
        }
      `, 
      updateQuery: (previous, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex(link => link.id === subscriptionData.Vote.node.link.id);
        const link = subscriptionData.Vote.node.link;
        const newAllLinks = previous.allLinks.slice();
        newAllLinks[votedLinkIndex] = link;
        const result = { 
          ...previous, 
          allLinks: newAllLinks 
        };
        return result;
      } 
    });
  }

  _subscribeToNewLinks = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          Link(filter: {
            mutation_in: [CREATED]
          }) {
            node {
              id
              url
              description
              createdAt
              postedBy {
                id
              }
              votes {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [
          subscriptionData.Link.node,
          ...previous.allLinks
        ]
        const result = {
          ...previous,
          allLinks: newAllLinks
        }
        return result
      }
    })
  }

}

export const FEED_QUERY = gql`
         query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
           _allLinksMeta {
             count
           }
           allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
            id
            createdAt
            url
            description
            postedBy {
              id
              email
            }
            votes {
              id
              user {
                id
              }
            }
           }
         }
       `;

export default graphql(FEED_QUERY, { 
  name: 'feedQuery',
  options: ownProps => {
    const page = parseInt(ownProps.match.params.page, 10)
    const isNewPage = ownProps.location.pathname.includes('new')
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return {
      variables: { first, skip, orderBy }
    } 
  }, 
}) (LinkList)