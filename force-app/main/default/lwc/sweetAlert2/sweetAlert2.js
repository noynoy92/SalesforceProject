import { LightningElement,track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SWEETALERT from '@salesforce/resourceUrl/SweetAlert';
export default class SweetAlert2 extends LightningElement {
    @track sweetAlertLoaded = false;

    renderedCallback(){
        if (this.sweetAlertLoaded) {
            return;
        }

        this.sweetAlertLoaded = true;

        loadScript(this, SWEETALERT)
        .then(() => {
            console.log('SweetAlert2 loaded');
             console.log('Swal:', window.Swal);
        })
        .catch(error => {
            console.error('Failed to load SweetAlert2', error);
        });
    }
    handleAlert() {
    Swal.fire({
        title: 'Success!',
        text: 'Your record was saved successfully.',
        icon: 'success',
        position: 'center-start'
    });
}
}