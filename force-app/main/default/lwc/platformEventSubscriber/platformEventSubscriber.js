import { LightningElement } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag } from 'lightning/empApi';
export default class PlatformEventSubscriber extends LightningElement {
    channelName = '/event/Message_Event__e';

    connectedCallback() {
        this.handleSubscribe();
    }
    handleSubscribe() {
        const messageCallback = (response) => {
            console.log('New platform event received: ', JSON.parse(JSON.stringify(response)));
        };
        subscribe(this.channelName, -1, messageCallback).then((response) => {
            console.log('Subscribed to channel: ', response.channel);
        });
    }
}