import { LightningElement,track,api } from 'lwc';

export default class MultiSelectCombobox extends LightningElement {
    @api items;
    @api selectedItems;
    @api defaultValue;//['test 1','test 2']
    @api label;
    @track itemsInternal;
    @track placeHolder;
    @track isCSSLoad = false;
    @track defaultItems;

    connectedCallback(){
        const generateUniqueID = (lenghtId) => [...Array(lenghtId).keys()].map((elem)=>Math.random().toString(36).substr(2, 1)).join("");
        if(this.isEmpty(this.items)){
            return;
        }

        let defaultValueMap;
        if(!this.isEmpty(this.defaultValue)){
            defaultValueMap = new Map(
                this.defaultValue.map(value => [value, value])
            );
        }
        this.itemsInternal = (this.items || []).map(item => ({
            ...item,
            uniqueId: generateUniqueID(17),
            isShow:true,
            isCheck: defaultValueMap ? (defaultValueMap.has(item.value) ? true : false) : false
        }));
        this.itemsInternal.push({label:`No results found `,value:'No results found',isCheck:false,uniqueId:'No-results-found',isShow:false});
        this.defaultItems = this.itemsInternal;
        
        console.log('this.itemsInternal ',JSON.stringify(this.itemsInternal));
    }
    renderedCallback(){
        if(this.itemsInternal){
            const checkNum = this.itemsInternal.filter(item => item.isCheck)?.length;
            if(checkNum > 0){
                this.placeHolder = checkNum + ' '+this.label +' Selected';
            }else{
                this.placeHolder = 'Search ' + this.label +'...';
            }
        }

        if(this.isCSSLoad){
            return;
        }
        this.isCSSLoad = true;
        const style = document.createElement('style');
        style.innerText = `
            .multi-select-wrapper .slds-listbox__item lightning-icon.slds-icon-utility-check svg.slds-icon.slds-icon-text-default {
                width: 20px;
                height: 20px;
            }
        `;
        this.template.querySelector('.multi-select-wrapper').appendChild(style);
    }
    handleSearch(event){
        console.log('value ',event.target.value);
        const searchValue = event.target.value;
        if(searchValue){
            const itemsMap = this.itemsInternal.map(item =>{
                if(item.uniqueId != 'No-results-found'){
                    item.isShow = item.label.toLowerCase().includes(searchValue.toLowerCase());
                }else{
                    item.isShow = false;
                }
                return item;
            });
            console.log('itemsMap 84 ', JSON.stringify(itemsMap));
            console.log('length ', itemsMap.length);
            const count = itemsMap.filter(
                item => item.isShow === true && item.uniqueId !== 'No-results-found'
            ).length;
            if(count == 0){
                this.itemsInternal = this.itemsInternal.map(item => ({
                    ...item,
                    isShow: item.uniqueId == 'No-results-found' ? true : false
                }));
            }else{
                this.itemsInternal = itemsMap;
            }
        }else{
            this.showAllItems();
        }
        console.log('search ',JSON.stringify(this.itemsInternal));
    }
    showAllItems(){
        this.itemsInternal = this.itemsInternal.map(item => ({
            ...item,
            isShow: item.uniqueId == 'No-results-found' ? false : true
        }));
    }
    isEmpty(value) {
        return (
            value == null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0)
        );
    }
    handleOpenDropdown(event){
        const element = this.template.querySelector('.msc-dropdown');
        if(element){
            element.classList.add('slds-is-open');
        }
    }
    handleBlur(event){
        const element = this.template.querySelector('.msc-dropdown');
        if(element){
            element.classList.remove('slds-is-open');
            this.showAllItems();
        }
        const input = this.template.querySelector('[data-id="searchInput"]');
        if (input) {
            input.value = '';
        }
    }
    handleSelect(event){
        console.log('id ',event.currentTarget.dataset.id);
        this.processItems(event.currentTarget.dataset.id);
    }
    handleRemove(event){
        this.processItems(event.currentTarget.dataset.id);
    }
    processItems(uniqueId){
        this.itemsInternal = this.itemsInternal.map(item => {
            if (item.uniqueId === uniqueId) {
                return {
                    ...item,
                    isCheck: !item.isCheck
                };
            }
            return item;
        });
        //this.defaultItems = this.itemsInternal;
        const selectedValues = this.itemsInternal.filter(item => item.isCheck).map(item => item.value);
        this.dispatchEventMethod(selectedValues);
    }
    dispatchEventMethod(items){
        this.dispatchEvent(
            new CustomEvent('selectchange', {
                detail: {
                    value: items
                }
            })
        );
    }
}