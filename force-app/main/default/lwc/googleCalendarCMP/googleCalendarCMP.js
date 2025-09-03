import { LightningElement } from 'lwc';
import getUserEvents from '@salesforce/apex/googleCalendarCMPCTRL.getUserEvents';
export default class GoogleCalendarCMP extends LightningElement {
    connectedCallback(){
        console.log('im here 5');
    }
    handleClick(){
        // window.open('/services/auth/Google_Calendar_Cred/auth', "_self");
        getUserEvents().then(result => {
            console.log('result 10 ',JSON.parse(result.result));
            // window.open(result, "_blank");
        }).catch(error => {
            console.log('error => ',error);
        });
    }
}