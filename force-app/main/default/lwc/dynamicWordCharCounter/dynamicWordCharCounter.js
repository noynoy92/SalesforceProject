import { LightningElement,api,track } from 'lwc';

export default class DynamicWordCharCounter extends LightningElement {
    @api label;
    @api limit;
    @api isWord = false;
    @api isCharacter = false;
    @api isRequired = false;
    @api value;
    @track remainingNum;

    connectedCallback(){
        this.remainingNum = this.limit;
        if(this.value){
            if(this.isWord){
                setTimeout(() => {
                    this.processWord(this.value);
                }, 1000);
            }else if(this.isCharacter){
                setTimeout(() => {
                    this.processCharacter(this.value);
                }, 1000)
            }
        }
    }

    handleCount(event){
        var value = event.detail.value;
        if(this.isCharacter){
            this.processCharacter(value);
        }else if(this.isWord){
            this.processWord(value);

        }
    }
    processCharacter(value){
        var finalVal = value.slice(0,this.limit);
        this.remainingNum = this.limit - finalVal.length;
        this.template.querySelector('[data-id="input-char"]').value = finalVal;
        this.dispatchEvent( new CustomEvent('selected_value', {
            detail: {
                value : finalVal
            }
        }));
    }
    processWord(value){
        var finalVal=value.split(/[\s]+/).splice(0,this.limit).join(' ');
        var valueLenght = finalVal.split(' ').length;
        this.remainingNum = this.limit - valueLenght;
        this.template.querySelector('[data-id="textarea-input"]').value = finalVal;
        this.dispatchEvent( new CustomEvent('selected_value', {
            detail: {
                value : finalVal
            }
        }));
    }
}