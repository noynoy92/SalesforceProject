import { LightningElement,track,api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import INTL_TEL_INPUT from '@salesforce/resourceUrl/intlTelePhoneInput';
import INVALID_PHONE_NUMBER_MESSAGE from '@salesforce/label/c.phoneErrorMessage';
export default class IntlTelePhoneInput extends LightningElement {
    @api defaultValue;
    @api defaultCountry;
    @api placeHolder = 'Enter mobile number';
    @api outPutNumber;
    @api isValidNumber = false;
    @api selectedCountry;
    @api isUsedInFlow = false;
    @api useGEOLocation =false;
    @track isInitialized = false;
    @track showPhoneError;
    phoneInput;
    labels = {errorMessage:INVALID_PHONE_NUMBER_MESSAGE};
    renderedCallback(){
        if(this.isInitialized){
            return;
        }
        this.isInitialized = true;

        Promise.all([
            loadScript(
                this,
                INTL_TEL_INPUT + '/intlTelePhoneInput/intlTelInputWithUtils.min.js'
            ),
            loadStyle(
                this,
                INTL_TEL_INPUT + '/intlTelePhoneInput/intlTelInput.min.css'
            )
        ])
        .then(() => {
            console.log('css and script loaded');
            this.initializePhoneInput();
        })
        .catch(error => {
            console.error('Failed to load intl-tel-input', error);
        });

        const style = document.createElement('style');
        style.innerText = `
            .international-phone-wrapper input.phone-input.iti__tel-input {
                border: 1px solid #e3e9f0;
                border-radius: 3px;
                padding:5px;
            }
            .international-phone-wrapper input.phone-input.iti__tel-input, .international-phone-wrapper .iti.iti--allow-dropdown.iti--show-flags.iti--inline-dropdown {
                width:100%;
            }
        `;
        this.template.querySelector('.international-phone-wrapper').appendChild(style);
    }
    async initializePhoneInput() {

        const input = this.template.querySelector(
            '.phone-input'
        );

        if (!input) {
            console.error('Phone input not found');
            return;
        }
        if (typeof window.intlTelInput !== 'function') {

            console.error(
                'intlTelInput is not available on window'
            );

            return;
        }
        let countryCode = this.defaultCountry?.toLowerCase();
        console.log('countryCode ',countryCode);
        console.log('this.useGEOLocation ',this.useGEOLocation);
        if(this.useGEOLocation){
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                console.log('GeoIP data:', data);
                if (data.country_code) {
                    countryCode = data.country_code.toLowerCase();
                }

                console.log('Country code:', countryCode);

            } catch (error) {
                console.error('GeoIP error:', error);
            }
        }
        this.phoneInput = window.intlTelInput(
            input,{
                initialCountry: countryCode,
                separateDialCode: true
            }
        );
        if(this.defaultValue){
            // Default value
            this.phoneInput.setNumber(this.defaultValue);
            this.showPhoneErrorMethod();
            if(this.isUsedInFlow){
                this.checkValidity();
            }else{
                this.dispatchEventTele();
            }
        }

        input.addEventListener('input', this.handlePhoneInput.bind(this));
        input.addEventListener(
            'countrychange',
            this.handleCountryChange.bind(this)
        );
    }
    showPhoneErrorMethod(){
        if(!this.phoneInput.isValidNumber()){
            this.showPhoneError = true;
        }else{
            this.showPhoneError = false;
        }
    }
    handlePhoneInput(event) {
        const input = event.target;

        const rawValue = input.value;

        const fullNumber = this.phoneInput.getNumber();

        const isValid = this.phoneInput.isValidNumber();
        
        console.log('Raw number:', rawValue);
        console.log('Full number:', fullNumber);
        console.log('Valid:', isValid);
        this.showPhoneErrorMethod();
        if(this.isUsedInFlow){
            this.checkValidity();
        }else{
            this.dispatchEventTele();
        }
    }
    handleCountryChange() {
        this.showPhoneErrorMethod();
        if(this.isUsedInFlow){
            this.checkValidity();
        }else{
            this.dispatchEventTele();
        }
    }
    dispatchEventTele(){
        this.dispatchEvent(
            new CustomEvent('phonechange', {
                detail: {
                    value: this.phoneInput.getNumber(),
                    isValid: this.phoneInput.isValidNumber(),
                    selectedCountry: this.getCountryData().iso2
                }
            })
        );
    }
    getCountryData(){
        return this.phoneInput.getSelectedCountryData();
    }
    checkValidity(){
        this.isValidNumber = this.phoneInput.isValidNumber();
        this.outPutNumber = this.phoneInput.getNumber();
        this.selectedCountry = this.getCountryData().iso2;
    }
}