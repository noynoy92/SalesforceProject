import { LightningElement,api,track } from 'lwc';
import getAllObjectinSF from '@salesforce/apex/DynamicRecordCreationCTRL.getAllObject';
import getFieldSetFields from '@salesforce/apex/DynamicRecordCreationCTRL.getFieldSetField';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class DynamicRecordCreation extends LightningElement {
    @api objectlists;
    @api fieldsetnaming;
    @track options;
    @track objectData;
    @track objectLabel;
    @track showDropdown = false;
    @track showRecordForm =false;
    @track iterator = 0;
    connectedCallback(){
        getAllObjectinSF({objectList:this.objectlists})
        .then(result =>{
            if(result){
                console.log('result ',result);
                this.options = result;
                this.showDropdown = true;
            }
        }).catch(error =>{
            console.error('Error occured ',error);
        })
    }
    handleChange(event){
        console.log('value ',event.detail.value);
        this.showDropdown = false;
        getFieldSetFields({objectName:event.detail.value,namingConvention:this.fieldsetnaming})
        .then(result =>{
            if(result){ 
                console.log('result 30 ',result);
                this.objectLabel = result.objectLabel;
                this.objectData = {objectName:event.detail.value,fields:result.fields};
                this.showRecordForm = true;
            }
        }).catch(error =>{
            console.error('error occured :',error);
        })
    }
    handleCancel(event){
        this.showRecordForm = false;
        this.showDropdown = true;
    }
    handleSuccess(event){
        console.log('record id ',event.detail.id);
        const evt = new ShowToastEvent({
            title: `${this.objectLabel} created`,
            message: 'Record ID: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(evt);
        // setTimeout( () => {
        //     this.dispatchEvent(new CloseActionScreenEvent());
        // },1000);
    }
    renderedCallback(){
        this.iterator++;
        if(this.iterator == 1){
            const style = document.createElement('style');
            style.innerText = `
                c-dynamic-record-creation .dynamic-creation-container lightning-button.lightning-record-form-cancel{
                    display:none;
                }
                c-dynamic-record-creation .dynamic-creation-container lightning-button.cancel-btn{
                    position: relative;
                    float: right;
                    bottom : 53px;
                    right: 35%;
                }
            `;
            this.template.querySelector('.dynamic-creation-container').appendChild(style);
        }
    }
}