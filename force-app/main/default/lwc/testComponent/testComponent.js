import { LightningElement,wire,track } from 'lwc';
import { gql, graphql } from "lightning/uiGraphQLApi";
const SEARCH_QUERY = gql`
    query SearchAccounts($searchText: String) {
        uiapi {
            query {
                Account(
                    where: {
                        Name: {
                            like: $searchText
                        }
                    }
                ) {
                    edges {
                        node {
                            Id
                            Name {
                                value
                            }
                            AccountNumber{
                              value
                            }
                            Contacts{
                              edges{
                                node{
                                  Id
                                  Name{
                                    value
                                  }
                                  Email{
                                    value
                                  }
                                }
                              }
                            }
                            Opportunities{
                              edges{
                                node{
                                  Id
                                  Name{
                                    value
                                  }
                                  StageName{
                                    value
                                  }
                                }
                              }
                            }
                        }
                    }
                }
            }
        }
    }
`;
export default class TestComponent extends LightningElement {
    @track results;
    errors;
    @track searchText;
  
    @wire(graphql, {
        query: SEARCH_QUERY,
        variables: '$variables'
    })
  graphqlQueryResult({ data, errors }) {
    if (data) {
      const accounts = flattenGraphQL(data.uiapi.query.Account);
      this.results = accounts;
      console.log('this.results ',JSON.stringify(this.results));
    }else{
      console.log('errors ',errors);
      this.errors = errors;
    }
  }
  get variables() {
    if(!this.searchText){
      return undefined;
    }
    return {
        searchText: this.searchText
    };
  }

  handleChange(event){
    console.log('event.target.value ',event.target.value);
    if(event.target.value){
      this.searchText = `%${event.target.value}%`;
    }
  }
  
  
}
function flattenGraphQL(data) {
    if (Array.isArray(data)) {
        return data.map(flattenGraphQL);
    }

    if (data === null || typeof data !== 'object') {
        return data;
    }

    // GraphQL collection
    if ('edges' in data && Array.isArray(data.edges)) {
        return data.edges.map(edge => flattenGraphQL(edge.node));
    }

    // UI API scalar field
    if (
        Object.keys(data).length === 1 &&
        Object.prototype.hasOwnProperty.call(data, 'value')
    ) {
        return data.value;
    }

    const result = {};

    for (const [key, value] of Object.entries(data)) {
        result[key] = flattenGraphQL(value);
    }

    return result;
}