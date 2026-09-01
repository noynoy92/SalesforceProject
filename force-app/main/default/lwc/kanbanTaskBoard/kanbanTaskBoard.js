import { LightningElement,track,wire } from 'lwc';
import { gql, graphql } from "lightning/uiGraphQLApi";
import { updateRecord } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Task.Status';
const GET_TASK = gql`
    query GetTask{
        uiapi {
            query {
                Task(
                    where : {
                        Status: {
                            in: [ "Not Started", "In Progress", "Completed" ]
                        }
                    }
                ) {
                    edges {
                        node {
                            Id
                            Subject {
                                value
                            }
                            ActivityDate{
                                value
                            }
                            Priority{
                                value
                            }
                            OwnerId{
                                value
                            }
                            Status{
                                value
                            }
                            Description{
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;
export default class KanbanTaskBoard extends LightningElement {
    @track taskRecords;
    @track taskRecordsMap;
    @track status;
    @track isRendered = false;
    @track draggedTaskId;
    @wire(graphql, {
        query: GET_TASK
    })
    graphqlTaskQueryResult({ data, errors }) {
        console.log('data 47 ',JSON.stringify(data));
        if (data) {
            let tasks = data.uiapi.query.Task.edges.map(edge => ({
                Id: edge.node.Id,
                Subject: edge.node.Subject.value,
                ActivityDate: edge.node.ActivityDate.value,
                Priority: edge.node.Priority.value,
                OwnerId: edge.node.OwnerId.value,
                Status: edge.node.Status.value,
                Description: edge.node.Description.value
            }));
            tasks.map(row =>{
                if(row.Status == 'Not Started'){
                    row.todo = true;
                }else if(row.Status == 'In Progress'){
                    row.inProgress = true;
                }else if(row.Status == 'Completed'){
                    row.completed = true;
                }
                return row;
            });
            console.log('tasks 53 ',JSON.stringify(tasks));
            this.taskRecords = tasks;
            const taskMap = new Map(
                tasks.map(task => [task.Id, task])
            );
            this.taskRecordsMap = taskMap;
        }else{
            console.error('errors 57 ',errors);
        }
    }
    handleDragOver(event){
        event.preventDefault();
    }
    async handleDrop(event) {
        event.preventDefault();
        const newStatus = event.currentTarget.dataset.status;
        console.log('newStatus ',newStatus);
        console.log('Task:', this.draggedTaskId);
        const taskRec = this.taskRecordsMap.get(this.draggedTaskId);
        let fields;
        this.taskRecords.map(row =>{
            if(row.Id == taskRec.Id){
                row.Status = newStatus;
                if(newStatus == 'Not Started'){
                    row.inProgress = false;
                    row.completed = false;
                    row.todo = true;
                }else if(newStatus == 'In Progress'){
                    row.inProgress = true;
                    row.completed = false;
                    row.todo = false;
                }else if(newStatus == 'Completed'){
                    row.inProgress = false;
                    row.completed = true;
                    row.todo = false;
                }
                fields = {
                    Id: taskRec.Id,
                    [STATUS_FIELD.fieldApiName]: newStatus
                };
                return row;
            }
        });
        try {
            await updateRecord({ fields });

            console.log('Updated:');
        } catch (error) {
            console.error(error);
        }
        // console.log('New Status:', newStatus);
    }
    handleDragStart(event){
        console.log('im here 88');
        this.draggedTaskId = event.currentTarget.dataset.id;
    }
    renderedCallback(){
        if(this.isRendered){
            return;
        }
        this.isRendered = true;
        const style = document.createElement('style');
        style.innerText = `
            .task-board-wrapper .task {
                cursor: default;
            }
            .task-board-wrapper .task:active {
                cursor: grabbing;
            }
        `;
        this.template.querySelector('.task-board-wrapper').appendChild(style);
    }
}