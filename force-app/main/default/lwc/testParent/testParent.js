import { LightningElement } from 'lwc';

export default class TestParent extends LightningElement {
    useGeolocation = false;
    get defItems(){
        return [
            {label:'Test one',value:'Test one'},
            {label:'Test two',value:'Test two'},
            {label:'Test three',value:'Test three'},
            {label:'Test four',value:'Test four'},
            {label:'Test five',value:'Test five'},
            {label:'Test six',value:'Test six'},
            {label:'Test seven',value:'Test seven'}
        ];
    }
    get defVal(){
        return ['Test one','Test four'];
    }
    handlePhoneChange(event){
        console.log('event from child ', JSON.stringify(event.detail));
    }
    handleSelected(event){
        console.log('event from multi-select ',JSON.stringify(event.detail));
    }
}