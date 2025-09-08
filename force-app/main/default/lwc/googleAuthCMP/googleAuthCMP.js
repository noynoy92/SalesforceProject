import { LightningElement } from 'lwc';
import getToken from '@salesforce/apex/googleCalendarCMPCTRL.getAccessToken';
export default class GoogleAuthCMP extends LightningElement {
    communityBaseURL;
    connectedCallback(){
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        console.log('code ',code ,'state ',state);
        if(code){
            getToken({code:code}).then(result =>{
                console.log('result 11 ni ',result);
                if(result){
                    window.open(window.location.origin,'_self');
                }
            }).catch(error => {
                console.log('error => ',error);
            });
        }
    }
}