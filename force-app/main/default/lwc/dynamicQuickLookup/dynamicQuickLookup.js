import { LightningElement,api,track } from 'lwc';
import searchRecords from '@salesforce/apex/DynamicQuickLookupCTRL.getRecords';
import getDefaultRec from '@salesforce/apex/DynamicQuickLookupCTRL.getDefaultRecord';
import { loadScript } from 'lightning/platformResourceLoader';
import lodashRes from '@salesforce/resourceUrl/lodash';
export default class DynamicQuickLookupParent extends LightningElement {
    @api label;
    @api childlabel;
    @api placeHolder;
    @api objectAPIName;
    @api fieldToSearch;
    @api whereClause;
    @api defaultParentId;
    @api defaultChildId;
    @api childObjectAPIName;
    @api childFieldToSearch;
    @api childWhereClause;
    @api childToParentLookupFieldAPIName;
    @api parentId;
    @api childId;

    @track searchResult;
    @track searchResultChild;
    @track searchResultChildFiltered;
    @track delayTimeout;
    @track defaultVal = '';
    @track defaultChildVal = '';
    @track lodashInitialized = false;
    @track testMessage;
    @track selectedParent;
    @track showChildOption = false;
    @track showParentOption = false;
    componentName = 'c-dynamic-quick-lookup';
    delayedSearch;

    connectedCallback(){
        console.log('localName ',this.template.host.localName,'tagName ',this.template.host.tagName);
    }
    renderedCallback(){
        if (this.lodashInitialized) return;
        this.lodashInitialized = true;
        loadScript(this, lodashRes).then(() => {
            // Create debounced function after lodash loads
            console.log('lodash loaded');
            this.delayedSearch = _.debounce(this.getRecordMethod.bind(this), 1000,{ leading: false, trailing: true });
        }).catch(error => {
            console.error('Lodash failed to load', error);
        });

        // const resultDiv = this.template.querySelector('.quick-lookup-parent-container');
        // resultDiv.addEventListener("click", (event) => {
        //    this.handleClickOutside(event);
        // });
        //document.addEventListener('click', this.handleClickOutside);
        window.addEventListener("click", (event) => {
            this.hideDropdown(event);
        });
    }
    handleChange(event){
       // console.log('event.target.value ',event.target.value);
        var value = event.target.value;
        if(value){
            if(event.target.name == 'search-parent-record'){
                //query = this.generateQuery(this.fieldToSearch,this.objectAPIName, ' AND '+this.whereClause,'',value);
                var query = 'SELECT '+this.fieldToSearch+' FROM '+this.objectAPIName + ' WHERE '+this.fieldToSearch +' LIKE \'%'+value+'%\' ';
                if(this.whereClause){
                    query += ' AND '+this.whereClause;
                }
                this.delayedSearch(query,true);
               console.log('query 47 ',query);
            }else{
                var resultFilter = this.searchResultChild.filter(res => res.label.toLowerCase().includes(value.toLowerCase()));
                this.searchResultChildFiltered = (resultFilter.length > 0) ? resultFilter : [{label:'No Record Found',value:'',uniqueId:''}];
                
            }
        }else{
            if(event.target.name == 'search-parent-record'){
                this.searchResult = null;
                this.searchResultChild = null;
                this.searchResultChildFiltered = null;
                this.showChildOption = false;
            }else{
                this.searchResultChildFiltered = this.searchResultChild;
            }
        }
    }
    getRecordMethod(query,isParent){
        searchRecords(
        {   
            queryStr:query
        }
        ).then(result =>{
           // console.log('result 39 ',result);
            if(result.length > 0){
                const generateUniqueID = (lenghtId) => [...Array(lenghtId).keys()].map((elem)=>Math.random().toString(36).substr(2, 1)).join("");
                var items = [];
                for (const key in result) {
                    var field = isParent ? this.fieldToSearch : this.childFieldToSearch;
                    items.push({label:result[key][field],value:result[key].Id,uniqueId:generateUniqueID(17)});
                }
                if(isParent){
                    this.searchResult = items;
                    this.showParentOption =true;
                }else{
                    this.searchResultChild = items;
                    this.searchResultChildFiltered = items;
                }
            }else{
                var noItem = [{label:'No Record Found',value:'',uniqueId:''}];
                if(isParent){
                    this.searchResult = noItem;
                }else{
                    this.searchResultChild = noItem;
                }
            }
        }).catch(error =>{
            console.error('error 27 ',error);
        })
    }
    handleSelectedParent(event){
        // this.selectedParent = event.detail.value;
        this.defaultVal = event.detail.value.label;
        this.showParentOption = false;
        var childWhere = this.childToParentLookupFieldAPIName +'=\''+event.detail.value.value+'\'';
        // var query = this.generateQuery(this.childFieldToSearch,this.childObjectAPIName,this.childWhereClause,extraWhere,'');
        var query = 'SELECT '+this.childFieldToSearch+' FROM '+this.childObjectAPIName + ' WHERE '+childWhere;
        if(this.childWhereClause){
            query += ' AND '+this.childWhereClause;
        }
        console.log('query 95 ',query);
        this.getRecordMethod(query,false);
    }
    handleSelectedChild(event){
        console.log('value from child 97 ',event.detail.value);
        this.defaultChildVal = event.detail.value.label;
        this.showChildOption = false;
    }
    handleParentShow(event){
        this.showParentOption = event.detail.value;
    }
    handleChildShow(event){
        this.showChildOption = event.detail.value;
    }
    // selectSearchResult(event){
    //     console.log('event.target.dataset ',event.currentTarget.dataset.id);
    //     var selectedRecord = this.searchResult.find(element => element.uniqueId == event.currentTarget.dataset.id);
    //     if(typeof selectedRecord != 'undefined'  && selectedRecord != null && selectedRecord != ''){
    //         this.searchResult = null;
    //         this.defaultVal = selectedRecord.label;
    //     }
    // }
    showPickListOptions(event){
        //console.log('im here 78');
        if(this.searchResultChild){
            this.showChildOption = true;
        }
    }
    handleWrapperBlur(){
        console.log('im here 140');
    }
    handleFocusOut(){
        console.log('im here 143 ');
        //this.showParentOption = !this.showParentOption;
    }
    handleBlur(){
        document.addEventListener('click', this.handleClickOutside);
    }
    handleClickOutside = (event) => {
        const path = (event.path || []);
        const cmpName = this.template.host.tagName;
        console.log('cmpName ',cmpName);
        console.log('path ',path);
        if (!path.includes(this.template.host)) {
            console.log('im here 155');
        }
    }
    handleMouseLeave(){
        console.log('im leaving 150');
    }
    handleDivClick(event){
        console.log('📢 Parent Div caught bubbling event:', event.type);
    }
    hideDropdown(event){ 
        // const arr = event.path; 
        // var classNames = [];
        // Object.keys(arr).forEach(key => {
        //     console.log('keys ',key, arr[key].className);
        //     classNames.push(arr[key].className);
        // });
        // console.log('has classname ',classNames.includes('quick-lookup-parent-container'));
    }
    handleBlur(event){
        console.log('name ',event.currentTarget.dataset.name);
    }
}