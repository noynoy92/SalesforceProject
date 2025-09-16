import { LightningElement,track } from 'lwc';
import getUserEvents from '@salesforce/apex/googleCalendarCMPCTRL.getUserEvents';
import getAuthURL from '@salesforce/apex/googleCalendarCMPCTRL.getGoogleAuthUrl';
import getToken from '@salesforce/apex/googleCalendarCMPCTRL.getAccessToken';
import getCurrentUserToken from '@salesforce/apex/googleCalendarCMPCTRL.getUserAccessToken';
import getTestEvent from '@salesforce/apex/googleCalendarCMPCTRL.testGetEvent';
export default class GoogleCalendarCMP extends LightningElement {
    @track userAccessToken;
    connectedCallback(){
        console.log('base url ',window.location.origin);
        getCurrentUserToken().then(result =>{
            console.log('result 21 ',result);
            if(result){
                this.userAccessToken = result;
            }
        }).catch(error => {
            console.log('error => ',error);
        });
    }
    handleClick(){
        if(this.userAccessToken){
            getUserEvents({accessToken:this.userAccessToken.Access_Token__c,refreshToken:this.userAccessToken.Refresh_Token__c}).then(result=>{
                console.log('result 31 ',result);
            }).catch(error => {
                console.log('error => ',error);
                this.getAuthURLMethod();
            });
        }else{
            this.getAuthURLMethod();
        }
        getTestEvent().then(response=>{
            console.log('response 32 ',response);
        }).catch(error => {
            console.log('error => ',error);
        });
    }
    getAuthURLMethod(){
        getAuthURL().then(result => {
            console.log('result 37 ',result);
            const windowName = "smallWindow"; // A name for the new window
            const features = "width=500,height=400,toolbar=no,menubar=no,scrollbars=yes,resizable=yes";
            window.open(result, windowName, features);
        }).catch(error => {
            console.log('error => ',error);
        });
    }
}