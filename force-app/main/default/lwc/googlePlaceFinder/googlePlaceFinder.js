import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import googleMaps from '@salesforce/resourceUrl/googleMaps';
export default class GooglePlaceFinder extends LightningElement {
    apiKey = 'AIzaSyDjZkQPoB3VJqjZgvy1Y4EN1oqIA07yYKY'; // ⚠️ Store this securely (Named Credential or Custom Setting ideally)
    get vfUrl() {
        return `/apex/GooglePlaceFinderVF`;
    }
}