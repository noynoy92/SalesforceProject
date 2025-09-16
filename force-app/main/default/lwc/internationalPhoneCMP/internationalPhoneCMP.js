import { LightningElement,api,track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import intlTelInputWithUtils from '@salesforce/resourceUrl/intlTelInputWithUtils';
import intlTelInputCSS from '@salesforce/resourceUrl/intlTelInputCSS';
import intlTelInputRes from '@salesforce/resourceUrl/flagTelpicker';
import intlTelInputResource from '@salesforce/resourceUrl/intlTelInputResource';
import intlTelInputNew from '@salesforce/resourceUrl/intlTelInput';
export default class InternationalPhoneCMP extends LightningElement {
    @api defaultVal ='';
    @track initPhoneIntl;
    isLibLoaded = false;
    renderedCallback(){
        if (this.isLibLoaded) {
            return;
        }
        this.isLibLoaded = true;
        Promise.all([
            loadScript(this, intlTelInputNew + '/intlTelInput/js/intlTelInputWithUtils.js'),
            loadStyle(this,intlTelInputNew + '/intlTelInput/css/intlTelInput.css')
            // loadStyle(this,intlTelInputRes + '/flagTelpicker/css/intlTelInput.css'),
            // loadScript(this, intlTelInputRes + '/flagTelpicker/js/utils.js'),
            // loadScript(this, intlTelInputRes + '/flagTelpicker/js/intlTelInput.js')
            // loadScript(this, intlTelInputWithUtils),
            // loadStyle(this, intlTelInputCSS)
        ])
        .then(() => {
            console.log('Library and styles loaded');
            const input = this.template.querySelector('input[data-id="phone"]');
            if (input && window.intlTelInput) {
                console.log('im here 19');
                this.initPhoneIntl = window.intlTelInput(input, {
                    utilsScript:  intlTelInputNew + '/intlTelInput/js/intlTelInputWithUtils.js',
                    initialCountry :'PH',
                    separateDialCode: true,
                    formatAsYouType : true,
                    formatOnDisplay : true,
                    nationalMode : true
                });
            }
            input.addEventListener("countrychange", () => {
                // const iti = window.intlTelInput(input);
                // const countryData = iti.getSelectedCountryData();
                // console.log('countryData ',countryData);
                console.log('im here 34');
            });
        })
        .catch(error => {
            console.error('error => ',error);
        });
    }
    handleClick(event){
        try {
            const input = this.template.querySelector('input[data-id="phone"]');
            console.log('value 51 ',input.value);
            // const iti = window.intlTelInput(input);
            const isValid = this.initPhoneIntl.isValidNumber();
            console.log('isValid 51 ',isValid);
            const number = this.initPhoneIntl.getNumber();
            const countryData = this.initPhoneIntl.getSelectedCountryData();
            console.log('number ',number);
            console.log('countryData ',countryData);
        } catch (error) {
            console.error('error ',error);
        }
    }
}