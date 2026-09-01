import { LightningElement,track,wire,api } from 'lwc';
import { getRelatedListsInfo } from 'lightning/uiRelatedListApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import { gql, graphql } from "lightning/uiGraphQLApi";
const SEARCH_USER = gql`
    query SearchUser($userIds: [ID!]) {
        uiapi {
            query {
                User(
                    where: {
                        Id: { in: $userIds }
                    }
                ) {
                    edges {
                        node {
                            Id
                            Name {
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;
const SEARCH_APPROVALWORKITEM = gql`
    query SearchWorkItem($projectId: ID) {
        uiapi {
            query {
                ApprovalWorkItem(
                    where: {
                        RelatedRecordId: { eq: $projectId }
                    }
                ){
                    edges {
                        node {
                            Id
                            Name {
                                value
                            }
                            AssignedToId {
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;
const columns = [
    { label: "User", fieldName: "recordUrl", type: "url",hideDefaultActions: true,
        typeAttributes: {
            label: {
                fieldName: 'CreatedById'
            },
            target: '_blank'
        } 
    },
    { label: "Date", fieldName: "CreatedDate", type: "text",hideDefaultActions: true },
    { label: "Field", fieldName: "Field", type: "text",hideDefaultActions: true },
    { label: "Original Value", fieldName: "OldValue", type: "text",hideDefaultActions: true },
    { label: "New Value", fieldName: "NewValue", type: "text",hideDefaultActions: true }

];
export default class TestComponent extends LightningElement {
    @api recordId;
    @track listUserIds;
    @track approvalWorkItem;
    @track workItemHistory;
    @track listUsers = [];
    @track showTable = false;
    columns = columns;
    @wire(graphql, {
        query: SEARCH_USER,
        variables: '$variables'
    })
    graphqlQueryResult({ data, errors }) {
    if (data) {
      let users = data.uiapi.query.User.edges.map(edge => ({
            Id: edge.node.Id,
            Name: edge.node.Name.value
        }));

        // use map to avoid limit
      const userMap = new Map(
            users.map(user => [user.Id, user])
        );
        console.log('userMap ',userMap);
      this.workItemHistory.map(row =>{
        var user = userMap.get(row.CreatedById);
        if(typeof user != 'undefined' && user){
            console.log('user 71 ',JSON.stringify(user));
            row.CreatedById = user.Name;
            row.recordUrl = '/'+ user.Id;
            return row;
        }
      });
      console.log('this.workItemHistory ',this.workItemHistory);
      this.showTable = true;
    }else{
      console.log('errors ',errors);
    }
  }
  get variables() {
    if(!this.listUserIds){
      return undefined;
    }
    return {
        userIds: this.listUserIds
    };
  }

  @wire(graphql, {
        query: SEARCH_APPROVALWORKITEM,
        variables: '$workItemvariables'
    })
    graphqlWIQueryResult({ data, errors }) {
    if (data) {
      let approvalWorkItem = data.uiapi.query.ApprovalWorkItem.edges.map(edge => ({
        Id: edge.node.Id,
        Name: edge.node.Name.value,
        AssignedToId: edge.node.AssignedToId.value
    }));
    this.approvalWorkItem = approvalWorkItem[0].Id;
      console.log('ApprovalWorkItem ',JSON.stringify(approvalWorkItem[0]));
    }else{
      console.log('errors 88 ',errors);
    }
  }
  get workItemvariables(){
    if(this.recordId){
        return{
            projectId : this.recordId
        };
    }
  }

  //only fires when approvalWorkItem is changed
    @wire(getRelatedListRecords, {
        parentRecordId: '$approvalWorkItem',
        relatedListId: 'Histories',
        fields: ['ApprovalWorkItemHistory.Id','ApprovalWorkItemHistory.CreatedDate','ApprovalWorkItemHistory.CreatedById','ApprovalWorkItemHistory.Field','ApprovalWorkItemHistory.NewValue','ApprovalWorkItemHistory.OldValue'],
        sortBy: ['-CreatedDate']
    })
    wiredHistory({ data, error }) {
        if (data) {
            console.log('data ',data.records);
            const workItemHistory = data.records;
            let userIds = [];
            let workItemHistories = [];
            for (const key in workItemHistory) {
                console.log('fields ',workItemHistory[key].fields);
                userIds.push(workItemHistory[key].fields.CreatedById.value);
                let historyFields = {};
                Object.entries(workItemHistory[key].fields).forEach(([key, value]) => {
                    if(key == 'CreatedDate'){
                        historyFields.CreatedDate = value.displayValue;
                    }else{
                        historyFields[key] = value.value;
                    }
                });
                workItemHistories.push(historyFields);
            }
            console.log('workItemHistories ',workItemHistories);
            this.workItemHistory = workItemHistories;
            console.log('userIds ',userIds);
            if(userIds.length > 0){
                this.listUserIds = userIds;
            }
        }else if (error) {

        }
    }

    renderedCallback(){
        console.log('listUsers ',JSON.stringify(this.listUsers),' workItemHistory ',this.workItemHistory);
    }
}