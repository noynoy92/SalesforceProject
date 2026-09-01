import { LightningElement } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
export default class CustomPhoneSearch extends OmniscriptBaseMixin(LightningElement)  {
    connectedCallback() {
        console.log('this.omniJsonData ',this.omniJsonData);
    }
    handleChange(event) {
        console.log('event.target.value ',event.target.value);
        this.omniUpdateDataJson({
            StudentName: event.target.value
        });
    }
    
}