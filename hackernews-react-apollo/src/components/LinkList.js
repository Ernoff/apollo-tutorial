import React, { Component } from 'react'
import Link from './Link'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

class LinkList extends Component {
  
  render(){

    if (this.props.allLinksQuery && this.props.allLinksQuery.loading){
      return <div>Loading</div>
    }

    if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
      return <div>Error</div>
    }

    const linksToRender = this.props.allLinksQuery.allLinks
  //   const linksToRender = [{
  //     id: '1',
  //     description: 'The coolest GraphQl Backend :)',
  //     url: 'https://www.graph.cool'
  //   }, {
  //     id: '2',
  //     description: 'The Best GraphQL Client',
  //     url: 'http://dev.apollodata.com/'
  //   }]
    
    
    return (
      <div>
        {linksToRender.map(link => (
          <Link key={link.id} link={link} />
        ))}
      </div>
    )
  }
}

const ALL_LINKS_QUERY = gql`
  query AllLinksQuery {
    allLinks {
      id
      url
      description
    }
  }
`

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' }) (LinkList)