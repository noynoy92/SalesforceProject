@RestResource(urlMapping='/GoogleOAuthCallback')
global with sharing class GoogleOAuthWebhook {
    @HttpGet
    global static void handleCallback() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        String authCode = req.params.get('code');
        System.debug('Authorization Code: ' + authCode);
        res.responseBody = Blob.valueOf('Google Calendar connected successfully!');
    }
}