import { LightningElement } from 'lwc';

export default class TestParent extends LightningElement {
    useGeolocation = false;
    handlePhoneChange(event){
        console.log('event from child ', JSON.stringify(event.detail));
    }
}