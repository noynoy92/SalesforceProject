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
                        }
                    }
                }
            }
        }
    }
`;
export default class TestComponent extends LightningElement {
    results;
    errors;
    @track searchText;
  
    @wire(graphql, {
        query: SEARCH_QUERY,
        variables: '$variables'
    })
  graphqlQueryResult({ data, errors }) {
    if (data) {
      console.log('data ',data);
      this.results = data.uiapi.query.Account.edges.map((edge) => edge.node);
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