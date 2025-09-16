import { LightningElement,api,track } from 'lwc';
export default class QuickLookupInput extends LightningElement {
    @api searchResult;
    @api containerName;
    @api set message(value){
        console.log('value 5 ',value);
    }
    get message(){
        return this._message;
    }
    isListening = false;
    connectedCallback(){
        console.log('this.containerName ',this.containerName );
    }

    renderedCallback() {
        if (this.isListening) return;
        window.addEventListener('click', this.hideDropdown);
        // window.addEventListener("click", (event) => {
        //     this.hideDropdown(event);
        // });
        this.isListening = true;
    }
    disconnectedCallback(){
        console.log('im here 22');
        window.removeEventListener('click', this.hideDropdown);
    }
    hideDropdown = (event) => {
        const arr = event.path; 
        var classNames = [];
        Object.keys(arr).forEach(key => {
            console.log('keys 29 ',key, arr[key].className);
            classNames.push(arr[key].className);
        });
        console.log('has classname 28 ',classNames.includes(this.containerName),' containerName ',this.containerName);
        if(!classNames.includes(this.containerName)){
            this.dispatchEvent( new CustomEvent('show_result', {
                detail: {
                    value : false
                }
            }));
        }
        
    }

    handleBlur(){
        console.log('im leaving');
    }
    handleFocus(){
        console.log('im here 41');
    }
    handleMouseLeave(){
        console.log('im leaving 37');
    }

    selectSearchResult(event){
        var selectedRecord = this.searchResult.find(element => element.uniqueId == event.currentTarget.dataset.id);
        if(typeof selectedRecord != 'undefined'  && selectedRecord != null && selectedRecord != ''){
            this.dispatchEvent( new CustomEvent('selected_value', {
                detail: {
                    value : selectedRecord
                }
            }));
        }
    }
}