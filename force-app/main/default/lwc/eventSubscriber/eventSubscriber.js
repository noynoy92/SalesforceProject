import { LightningElement } from 'lwc';
import { APPLICATION_SCOPE, createMessageContext, releaseMessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import subscribeEventData from '@salesforce/messageChannel/eventChannel__c';
export default class EventSubscriber extends LightningElement {
    context = createMessageContext();

    connectedCallback(){
        subscribe(this.context, subscribeEventData, (message) => {
            console.log('message 9 ',message);
        },
        {
            scope: APPLICATION_SCOPE
        });
    }
}