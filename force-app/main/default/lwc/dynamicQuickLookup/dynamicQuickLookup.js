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
        if(this.defaultParentId && this.defaultChildId){
            const payload = {
                parentObjectAPI:this.objectAPIName,
                childObjectAPI:this.childObjectAPIName,
                parentFieldToSearch:this.fieldToSearch,
                childFieldToSearch:this.childFieldToSearch,
                defaultParentId: this.defaultParentId,
                defaultChildId: this.defaultChildId
            };
            getDefaultRec({jsonData:JSON.stringify(payload)})
            .then(result =>{
                if(result[this.objectAPIName].length > 0){
                    this.defaultVal = result[this.objectAPIName][0][this.fieldToSearch];
                    this.parentId = result[this.objectAPIName][0]['Id'];
                }
                if(result[this.childObjectAPIName].length > 0){
                    const items = [];
                    const generateUniqueID = (lenghtId) => [...Array(lenghtId).keys()].map((elem)=>Math.random().toString(36).substr(2, 1)).join("");
                    let childRecord = result[this.childObjectAPIName][0];
                    childRecord.label = childRecord[this.childFieldToSearch];
                    childRecord.value = childRecord['Id'];
                    childRecord.uniqueId = generateUniqueID(17);
                    items.push(childRecord);
                    this.searchResultChild = items;
                    this.searchResultChildFiltered = items;
                    this.defaultChildVal = childRecord[this.childFieldToSearch];
                    this.childId = childRecord['Id'];
                }
            })
            .catch(error =>{
                console.error(error);
            })
        }
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
        // window.addEventListener("click", (event) => {
        //     this.hideDropdown(event);
        // });
    }
    get parentPlaceHolder(){
        return `Search ${this.label}...`;
    }
    get childPlaceHolder(){
        return `Search ${this.childlabel}...`;
    }
    handleChange(event){
       console.log('event.target.value ',event.target.value);
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
                this.defaultVal = '';
                this.defaultChildVal = '';
                this.parentId = '';
                this.childId = '';
            }else{
                this.searchResultChildFiltered = this.searchResultChild;
                this.defaultChildVal = '';
                this.childId = '';
            }
        }
    }
    getRecordMethod(query,isParent){
        searchRecords(
        {   
            queryStr:query
        }
        ).then(result =>{
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
                    this.searchResultChildFiltered = noItem;
                }
            }
            console.log('this.searchResultChildFiltered 118 ',this.searchResultChildFiltered);
        }).catch(error =>{
            console.error('error 27 ',error);
        })
    }
    handleSelectedParent(event){
        // this.selectedParent = event.detail.value;
        console.log('event.detail.value 122 ',event.detail.value);
        this.parentId = event.detail.value.value;
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
        this.childId = event.detail.value.value;
        this.defaultChildVal = event.detail.value.label;
        this.showChildOption = false;
    }
    handleParentShow(event){
        this.showParentOption = event.detail.value;
    }
    handleChildShow(event){
        this.showChildOption = event.detail.value;
    }
    showPickListOptions(event){
        //console.log('im here 78');
        if(this.searchResultChild){
            this.showChildOption = true;
        }
    }
}