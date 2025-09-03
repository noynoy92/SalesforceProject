import { LightningElement } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { createMessageContext, releaseMessageContext, publish } from 'lightning/messageService';
import publishEventData from '@salesforce/messageChannel/eventChannel__c';
export default class ChangeDataCaptureSample extends LightningElement {
    context = createMessageContext();
    channelName = '/data/Event__ChangeEvent';
    subscription = null;
    connectedCallback(){
        console.log('im here 7');
        this.handleSubscribe();
        console.log('im here 9');
    }
    handleSubscribe() {
        const messageCallback = (response) => {
            console.log('response 11 ',response);
            const message = {
                recordId:'test id',
                recordData:'test data'
            };
            publish(this.context, publishEventData, message);
        };


        subscribe(this.channelName, -1, messageCallback).then(response => {
            this.subscription = response;
            console.log('response 17 ',response);
        }).catch(error => {
            console.error('Subscription failed:', error);
        });
        onError(error => {
            console.error('Streaming API error: ', error);
        });
    }
    // handleSubscribe() {
    //     const messageCallback = (response) => {
    //         console.log('response 24 ',response);
    //     };
    //     subscribe(this.channelName, -1, messageCallback).then(response => {
    //         this.subscription = response;
    //         console.log('response 28 ',response);
    //     }).catch(error => {
    //         console.error('Subscription failed:', error);
    //     });
    // }
}