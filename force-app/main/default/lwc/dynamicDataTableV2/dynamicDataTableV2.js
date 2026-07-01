import { LightningElement,api,track } from 'lwc';
import getAllRecords from '@salesforce/apex/dynamicDataTableV2CTRL.getRecords';
import saveCSVData from '@salesforce/apex/dynamicDataTableV2CTRL.saveCSV';
import userId from '@salesforce/user/Id';
import { deleteRecord,updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import dynamicTableResource from '@salesforce/resourceUrl/DynamicTableIcon';
export default class DynamicDataTableV2 extends LightningElement {
    @api header = 'Test Header';
    @api description = 'Test Description';
    @api fieldsetAPIName = 'Account_FieldSet';
    @api objectAPIName = 'Account';
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
    @api showPagination = false;
    @api allowSearch = false;
    @api customColumn;

    @track data;
    @track showSpinner = true;
    @track column;
    @track inputVariable;
    @track showEditModal = false;
    @track showViewModal = false;
    @track showDeleteModal = false;
    @track showAddModal = false;
    @track showImportModal = false;
    @track iterator = 0;
    @track idToDelete;
    @track draftValues = [];
    @track errorMessage;

    @track pageSize=5;
    @track totalPages = 0;
    @track currentPage = 1;
    @track allRecords;
    @track showTableFooter = true;
    @track recordsSize;
    @track showNoRecords = false;

    exportIcon = dynamicTableResource + '/DynamicTableV2Icon/file-export-solid-full.svg';
    importIcon = dynamicTableResource + '/DynamicTableV2Icon/file-import-solid-full.svg';

    connectedCallback(){
        console.log('userId ',userId);
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
                .dynamic-table-container button.slds-button.export-btn lightning-icon.slds-icon_container svg{
                    border-radius: 5px;
                    opacity: 1;
                    fill:#aa233f;
                    bottom:13px;
                    position: relative;
                    width:42px;
                    height:40px;
                }
                .dynamic-table-container button.slds-button.import-btn lightning-icon.slds-icon_container svg{
                    border-radius: 5px;
                    opacity: 1;
                    fill:#aa233f;
                    bottom:13px;
                    position: relative;
                    width:42px;
                    height:40px;
                }
                .dynamic-table-container button.slds-button.import-btn:focus {
                    box-shadow:unset;
                }
                .dynamic-table-container button.slds-button.import-btn:active{
                    border-color:unset !important;
                    border:unset;
                }

                .dynamic-table-container button.slds-button.export-btn:focus {
                    box-shadow:unset;
                }
                .dynamic-table-container button.slds-button.export-btn:active {
                    border-color:unset !important;
                    border:unset;
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
                .dynamic-table-container lightning-icon.slds-icon-utility-close.slds-icon_container svg{
                    fill:#808285;
                }
                .dynamic-table-container div.slds-modal__content {
                    border-radius: 5px;
                }
                .dynamic-table-container .table-header .slds-select_container select.slds-select{
                    border: 1px solid #808285;
                }
                // .dynamic-table-container .data-table-section lightning-datatable td.table-items:hover::after {
                //     content: attr(data-cell-value);
                //     position: absolute;
                //     //bottom: 100%;
                //     //left: 50%;
                //     transform: translateX(-50%);
                //     white-space: nowrap;
                //     background: #333;
                //     color: #fff;
                //     padding: 6px 10px;
                //     border-radius: 4px;
                //     z-index: 1000;
                // }

            `;
            this.template.querySelector('.dynamic-table-container').appendChild(style);
        }

        if(this.data){
            this.showNoRecords = this.data.records.length > 0 ? false : true;
        }
    }
    getRecordMethod(){
        console.log('objectAPIName ',this.objectAPIName,'fieldsetAPIName 120 ',this.fieldsetAPIName);
        getAllRecords({objectName:this.objectAPIName,fieldSet:this.fieldsetAPIName,whereClause:this.whereClauseStatement,exportFieldSet:this.exportFieldSet})
        .then(result =>{
            if(result){
                console.log('result 79 ',result);
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                console.log('timeZone ',timeZone);

                var columnItem = result.fieldInfos;
                columnItem.map(row=>{
                    switch (row.fieldType){
                        case 'DATE':
                            row.type = 'date-local',
                            row.typeAttributes = {   
                                                year: 'numeric',
                                                month: 'long',      
                                                day: '2-digit',
                                                timeZone: result.timeZoneId 
                                            }
                            break;
                        case 'DATETIME':
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
                            break;
                        case 'CURRENCY':
                            row.type = 'currency'
                            break; 
                        case 'URL':
                            row.type = 'url'
                            break;
                        case 'BOOLEAN':
                            row.type = 'boolean'
                            break;  
                        case 'INTEGER':
                            row.type = 'number'
                            break;  
                        case 'PHONE':
                            row.type = 'phone'
                            break;  
                        case 'EMAIL':
                            row.type = 'email'
                            break;  
                        default:
                            '';                             
                    }
                    if(this.allowInlineEdit && !row.isFormula && row.isEditable){
                        row.editable = true;
                    }
                    row.cellAttributes = {
                        class: 'table-items'
                    }
                    return row;
                });

                if(this.customColumn){
                    const customCol = this.customColumn.split(',');
                    columnItem = columnItem.map((item, index) => ({
                        ...item,
                        label: customCol[index]
                    }));
                }

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
                if(this.pageSize){
                    this.allRecords = result.records;
                    this.calculateTotalPage(this.allRecords);
                    this.recordsSize = this.allRecords.length;
                    result.records = this.updateDisplayeData(this.allRecords);
                }
                console.log('this.allRecords ',this.allRecords);
                this.data = result;
                this.showSpinner = false;
            }
        }).catch(error=>{
            console.error('error ',error);
        })
    }
    calculateTotalPage(records){
        this.totalPages =  Math.ceil(
            records.length / this.pageSize
        );
    }
    updateDisplayeData(records){
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return records.slice(start, end);
    }
    handleBack(){
        if (this.currentPage > 1) {
            this.currentPage--;
            this.data.records = this.updateDisplayeData(this.allRecords);
        }
    }
    handleNext(){
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.data.records = this.updateDisplayeData(this.allRecords);
        }
        console.log('this.data ',this.data);
        console.log('this.currentPage ',this.currentPage);
        console.log('this.totalPages ',this.totalPages);
    }
    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }
    get options() {
        return [
            { label: '5', value: 5 },
            { label: '10', value: 10 },
            { label: '20', value: 20 },
            { label: '50', value: 50 }
        ];
    }
    handlePageChange(event){
        this.pageSize = event.detail.value;
        this.currentPage = 1;
        this.calculateTotalPage(this.allRecords);
        this.data.records = this.updateDisplayeData(this.allRecords);
        this.recordsSize = this.allRecords.length;
    }
    handleSearchChange(event){
        const val = event.target.value;
        this.currentPage = 1;
        if(val){
            const results = this.allRecords.filter(item =>
                Object.entries(item)
                    .filter(([key]) => key !== 'Id')
                    .some(([, value]) =>
                        String(value).toLowerCase().includes(val.toLowerCase())
                    )
            );
            this.calculateTotalPage(results);
            this.data.records =  this.updateDisplayeData(results);
            this.recordsSize = results.length;
        }else{
            this.calculateTotalPage(this.allRecords);
            this.data.records = this.updateDisplayeData(this.allRecords);
            this.recordsSize = this.allRecords.length;
        }
    }
    handleBlur(event){
        console.log('Value:', event.target.value);
        // this.calculateTotalPage(this.allRecords);
        // this.data.records = this.updateDisplayeData(this.allRecords);
        // this.recordsSize = this.allRecords.length;
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
            this.showSpinner = false;
            this.errorMessage = error.body.message;
        })
    }
    closeImportModalbtn(){
        this.showImportModal = false;
        this.errorMessage = '';
    }

}