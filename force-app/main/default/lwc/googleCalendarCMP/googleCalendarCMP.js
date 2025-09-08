import { LightningElement,track } from 'lwc';
import getUserEvents from '@salesforce/apex/googleCalendarCMPCTRL.getUserEvents';
import getAuthURL from '@salesforce/apex/googleCalendarCMPCTRL.getGoogleAuthUrl';
import getToken from '@salesforce/apex/googleCalendarCMPCTRL.getAccessToken';
import getCurrentUserToken from '@salesforce/apex/googleCalendarCMPCTRL.getUserAccessToken';
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
    }
    getAuthURLMethod(){
        getAuthURL().then(result => {
            console.log('result 37 ',result);
            window.open(result, "_self");
        }).catch(error => {
            console.log('error => ',error);
        });
    }
}