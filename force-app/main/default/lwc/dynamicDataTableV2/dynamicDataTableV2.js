import { LightningElement,api,track } from 'lwc';
import getAllRecords from '@salesforce/apex/dynamicDataTableV2CTRL.getRecords';
import saveCSVData from '@salesforce/apex/dynamicDataTableV2CTRL.saveCSV';
import userId from '@salesforce/user/Id';
import { deleteRecord,updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class DynamicDataTableV2 extends LightningElement {
    @api header = '';
    @api description = '';
    @api fieldsetAPIName = '';
    @api objectAPIName = '';
    @api whereClauseStatement;
    @api editFlowAPIName;
    @api viewFlowAPIName;
    @api addFlowAPIName;
    @api showEditButton;
    @api showViewButton;
    @api showDeleteButton;
    @api showAddButton;
    @api allowInlineEdit;
    @api exportFieldSet;

    @track data;
    @track showSpinner = true;
    @track column;
    @track inputVariable;
    @track showEditModal = false;
    @track showViewModal = false;
    @track showDeleteModal = false;
    @track showAddModal = false;
    @track showImportModal = false;
    @track currentUserId = userId;
    @track iterator = 0;
    @track idToDelete;
    @track draftValues = [];
    @track errorMessage;

    connectedCallback(){
        console.log('objectAPIName ',this.objectAPIName);
        this.getRecordMethod();
    }
    renderedCallback(){
        this.iterator++;
        if(this.iterator == 1){
            const style = document.createElement('style');
            style.innerText = `
        ${
            this.allowInlineEdit ? `
                .dynamic-table-container .data-table-section lightning-datatable tr td:first-child{
                    display:none;
                }
                .dynamic-table-container .data-table-section lightning-datatable tr th:first-child{
                    display:none;
                }`
                :''
        }
                .dynamic-table-container .data-table-section lightning-datatable lightning-button-menu {
                    display:none;
                }
                .dynamic-table-container lightning-button-icon.add-record-btn {
                    bottom:10px;
                    position:relative;
                    background: #aa233f 0% 0% no-repeat padding-box;
                    border-radius: 5px;
                    opacity: 1;
                }
                .dynamic-table-container lightning-button-icon.add-record-btn lightning-primitive-icon {
                    color:white;
                }
                .dynamic-table-container .data-table-section lightning-datatable span.slds-resizable__handle {
                    display:none;
                }
                .dynamic-table-container button.slds-button.export-btn i.fa-solid.fa-file-export{
                    border-radius: 5px;
                    opacity: 1;
                    color:#aa233f;
                    font-size: 30px;
                    bottom: 7px;
                    position: relative;
                }
                .dynamic-table-container button.slds-button.import-btn i.fa-solid.fa-file-import{
                    border-radius: 5px;
                    opacity: 1;
                    color:#aa233f;
                    font-size: 30px;
                    bottom: 7px;
                    position: relative;
                }
                .dynamic-table-container button.slds-button.import-btn:focus {
                    box-shadow:unset;
                }
                .dynamic-table-container button.slds-button.import-btn:active{
                    border-color:unset !important;
                }

                .dynamic-table-container button.slds-button.export-btn:focus {
                    box-shadow:unset;
                }
                .dynamic-table-container button.slds-button.export-btn:active {
                    border-color:unset !important;
                }
                .dynamic-table-container .file-upload-section lightning-input span.slds-file-selector__button.slds-button{
                    border: 1px solid #dddbda;
                    border-radius: 4px;
                    opacity: 1;
                }

                .dynamic-table-container .file-upload-section lightning-input lightning-primitive-file-droppable-zone.slds-file-selector__dropzone {
                    border: 1px dashed #DDDBDA;
                }

                .dynamic-table-container .file-upload-section lightning-input label.slds-file-selector__body span.slds-file-selector__text {
                    color: #808285;
                }
            `;
            this.template.querySelector('.dynamic-table-container').appendChild(style);
        }
    }
    getRecordMethod(){
        getAllRecords({objectName:this.objectAPIName,fieldSet:this.fieldsetAPIName,whereClause:this.whereClauseStatement,exportFieldSet:this.exportFieldSet})
        .then(result =>{
            if(result){
                console.log('result 79 ',result);
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log('timeZone ',timeZone);

                var columnItem = result.fieldInfos;
                columnItem.map(row=>{
                    if(row.fieldType == 'DATE'){
                        row.type = 'date',
                        row.typeAttributes = {   
                                                year: 'numeric',
                                                month: 'long',      
                                                day: '2-digit',
                                                timeZone: result.timeZoneId 
                                            }
                    }else if(row.fieldType == 'DATETIME'){
                        row.type = 'date',
                        row.typeAttributes = {   
                                                year: 'numeric',
                                                month: 'long',      
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                                timeZone: result.timeZoneId 
                                            }
                    }
                    if(this.allowInlineEdit && !row.isFormula && row.isEditable){
                        row.editable = true;
                    }
                    return row;
                });

                console.log('columnItems 85 ',columnItem);
                if(this.showViewButton){
                    columnItem.push(
                        {
                            type: "button-icon",  initialWidth: 20, typeAttributes: {
                                name: 'View',
                                title: 'View',
                                disabled: false,
                                value: 'view',
                                iconPosition: 'left',
                                iconName:'utility:preview'
                            }
                        }
                    );
                }
                if(!this.allowInlineEdit && this.showEditButton){
                    columnItem.push(
                        {
                            type: "button-icon", initialWidth: 20, typeAttributes: {
                                name: 'Edit',
                                title: 'Edit',
                                disabled: false,
                                value: 'edit',
                                iconPosition: 'left',
                                iconName:'utility:edit'
                            }
                        }
                    );
                }
                if(this.showDeleteButton){
                    columnItem.push(
                        {
                            type: "button-icon",  initialWidth: 20, typeAttributes: {
                                name: 'Delete',
                                title: 'Delete',
                                disabled: false,
                                value: 'delete',
                                iconPosition: 'left',
                                iconName:'utility:delete'
                            }
                        }
                    );
                }

                this.column = columnItem;
                console.log('columnItem ',columnItem);
                console.log('result ',result);
                this.data = result;
                this.showSpinner = false;
            }
        }).catch(error=>{
            console.error('error ',error);
        })
    }
    handleExport(){
        const blob = new Blob([this.data.stringCSV]);
        const exportedFilename = this.objectAPIName +'.csv';
        const link = document.createElement("a");
        if(link.download !== undefined){
            const url = URL.createObjectURL(blob);
            console.log('url ',url);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility='hidden';
            document.body.appendChild(link);
            link.click();
            console.log('link 163 ',link);
            document.body.removeChild(link);
        }
    }
    closeEditModalbtn(){
        this.showEditModal = false;
    }
    closeViewModalbtn(){
        this.showViewModal = false;
    }
    closeDeleteModalbtn(){
        this.showDeleteModal = false;
    }
    closeAddModalbtn(){
        this.showAddModal = false;
    }
    callRowAction(event){
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        console.log('recId ',recId);
        console.log('actionName ',actionName);
        this.inputVariable = [
                {
                    name: 'recordId',
                    type: 'String',
                    value: recId
                },
                {
                    name:'action',
                    type:'String',
                    value:actionName
                }
            ];
        if(actionName == 'Edit'){
            this.showEditModal = true;
        }else if(actionName == 'View'){
            this.showViewModal = true;
        }else if(actionName == 'Delete'){
            this.idToDelete = recId;
            this.showDeleteModal = true;
        }
    }
    handleAdd(event){
        this.inputVariable = [
            {
                name: 'userID',
                type: 'String',
                value: this.currentUserId
            },
            {
                name:'action',
                type:'String',
                value:'Add'
            }
        ];
        this.showAddModal = true;
    }
    handleStatusChange(event){
        if (event.detail.status === 'FINISHED') {
            this.getRecordMethod();
        }
    }
    handleDelete(){
        deleteRecord(this.idToDelete)
            .then(result => {
                console.log('delete result ',result);
                const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Record deleted successfully!!',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
                this.showDeleteModal = false;
                this.getRecordMethod();
            }).catch(error => {
                console.error('error ',error);
            });
    }
    async handleSave(event){
        this.showSpinner = true;
        const records = event.detail.draftValues.slice().map((draftValue) => {
        const fields = Object.assign({}, draftValue);
            return { fields };
        });
        console.log('records 217 ',records);
        this.draftValues = [];
        try {
            const recordUpdatePromises = records.map((record) => updateRecord(record));
            await Promise.all(recordUpdatePromises);
            console.log('recordUpdatePromises ',recordUpdatePromises);
            this.getRecordMethod();
        } catch (error) {
            console.error('error',error);
            this.showSpinner = true;
        }
    }
    handleImport(){
        this.showImportModal = true;
    }
    handleFileUpload(event) {
        const file = event.detail.files[0];
        this.readCSV(file);
    }
    readCSV(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            const records = this.parseCSV(text);
            console.log('records 265 ',records);
            this.showSpinner = true;
            this.saveCSVMethod(records);
        };
        reader.readAsText(file);
    }
    parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].trim().split(',');

        const records = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',');
            let record = {};
            headers.forEach((key, idx) => {
                record[key.trim()] = values[idx]?.trim();
            });
            records.push(record);
        }

        return records;
    }
    saveCSVMethod(data){
        saveCSVData({csvRecords:JSON.stringify(data),objectName:this.objectAPIName})
        .then(result=>{
            console.log('save result ',result);
            this.errorMessage = '';
            this.showImportModal = false;
            this.getRecordMethod();
        }).catch(error =>{
            console.error('error ',error);
            this.errorMessage = error.body.message;
        })
    }
    closeImportModalbtn(){
        this.showImportModal = false;
        this.errorMessage = '';
    }

}