import { LightningElement,track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import DAYJS from '@salesforce/resourceUrl/dayjs';
export default class DateFormatter extends LightningElement {
    @track isInitialised = false;

    renderedCallback(){
        if(this.isInitialised){
            return;
        }
        this.isInitialised = true;

        loadScript(this, DAYJS)
        .then(() => {
            console.log('Day.js loaded');

            this.useDayjs();
        })
        .catch(error => {
            console.error(
                'Error loading Day.js',
                error
            );
        });
    }
    useDayjs() {
        const salesforceDate = '2026-07-06T00:35:34.000+0000';
        const date = window.dayjs(salesforceDate);
        console.log(
            date.format('MMMM DD, YYYY')
        );
    }
}