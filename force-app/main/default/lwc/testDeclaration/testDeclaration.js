import { LightningElement,api,track } from 'lwc';
import getDeclarationRecord from '@salesforce/apex/testDeclarationCTRL.getDeclaration';
import getUserDeclarationRecord from '@salesforce/apex/testDeclarationCTRL.getUserDeclaration';
import createUserDeclarationRecord from '@salesforce/apex/testDeclarationCTRL.createUserDeclaration';
import relinkfiles from '@salesforce/apex/dynamicFileUpload.fileNaming';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TestDeclaration extends LightningElement {
    @api declarationAPIName;
    @track isChecked = false;
    @track showModal = false;
    @track declarationData;
    @track userDeclarationData;
    @track label = 'I Agree to ';
    @track iterator = 0;
    @track fileData;

    connectedCallback(){
        this.getDeclarationMethod();
    }
    getDeclarationMethod(){
        getDeclarationRecord({apiName : this.declarationAPIName})
        .then(getDeclarationResult =>{
            if(getDeclarationResult){
                console.log('getDeclarationResult ',getDeclarationResult);
                this.label += getDeclarationResult.Name;
                this.declarationData = getDeclarationResult;
                this.getUserDeclarationMethod(getDeclarationResult.Id);
            }
        })
    }
    getUserDeclarationMethod(Id){
        getUserDeclarationRecord({declarationId : Id})
        .then(getUserDeclarationResult =>{
            if(getUserDeclarationResult){
                getUserDeclarationResult.AS_Declaration_Date__c = this.formatDate(getUserDeclarationResult.AS_Declaration_Date__c);
                console.log('getUserDeclarationResult ',getUserDeclarationResult);
                this.userDeclarationData = getUserDeclarationResult;
                this.isChecked = true;

                this.dispatchEvent( new CustomEvent('checked', {
                    detail: {
                        value : true
                    }
                }));
            }else{
                this.dispatchEvent( new CustomEvent('checked', {
                    detail: {
                        value : false
                    }
                }));
            }
        })
    }
    formatDate(inputDate) {
        const varDate = new Date(inputDate);
        var monthFinal = varDate.getMonth() + 1;
        var day = (varDate.getDate() < 10) ? '0' + varDate.getDate() : varDate.getDate();
        var month = (monthFinal < 10) ? '0' + monthFinal : monthFinal;
        var dates = new Date();
        dates.setMonth(month - 1);
        var monthName = dates.toLocaleString([], { month: 'long' });
        var date = day + ' ' + monthName + ' ' + varDate.getFullYear();
        return date;
    }

    handleChecked(event){
        this.showModal = true;
    }
    closeModal(event){
        this.showModal = false;
    }
    handleSave(event){
        var agreeButton = this.template.querySelector('[data-id="agreeCB"]').checked;
        if(this.declarationData.Required_File_Upload__c){
            if(this.fileData){
                if(this.fileData.value){
                    if(agreeButton){
                        this.createUserDeclarationMethod();
                    }else{
                        const event = new ShowToastEvent({
                            title: 'Error',
                            message: 'Please check the "I Agree" checkbox.',
                            variant: 'error'
                        });
                        this.dispatchEvent(event);
                    }
                }else{
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'File upload is required.',
                        variant: 'error'
                    });
                    this.dispatchEvent(event);
                }
            }else{
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'File upload is required.',
                    variant: 'error'
                });
                this.dispatchEvent(event);
            }
        }else{
            if(agreeButton){
                this.createUserDeclarationMethod();
            }else{
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please check the "I Agree" checkbox.',
                    variant: 'error'
                });
                this.dispatchEvent(event);
            }
        }
    }
    createUserDeclarationMethod(){
        createUserDeclarationRecord({declarationId:this.declarationData.Id})
        .then(createResult =>{
            if(createResult){
                console.log('createResult ',createResult);
                this.showModal = false;
                this.getUserDeclarationMethod(this.declarationData.Id);
                const event = new ShowToastEvent({
                    title: 'success',
                    message: 'New User Declaration created successfully.',
                    variant: 'success'
                });
                this.dispatchEvent(event);
                if(this.declarationData.Required_File_Upload__c){
                    let params = {
                        recordId: this.fileData.value,
                        namingConvention: null,
                        fieldKey: this.fileData.fieldKey,
                        main_linkId: null,
                        alt_linkId: createResult.Id,
                        isPublic: false
                    }
                    relinkfiles(params);
                }
            }
        })
    }
    uploadFile(event){
        this.fileData = event.detail;
    }
    renderedCallback(){
        this.iterator++;
        if(this.iterator == 1){
            var style = document.createElement('style');
            style.innerHTML = `
               .declaration-container lightning-input.agreebtn label.slds-checkbox__label span.slds-checkbox_faux {
                    border:1px solid #B2B2B2;
                }
                .declaration-container .modal_content_container c-dynamic-file-upload .f-up-control-wrap {
                    padding-left:unset !important;
                }
            `;
            this.template.querySelector('.declaration-container').appendChild(style);
        }
    }
}