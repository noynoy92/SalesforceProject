public with sharing class googleCalendarCMPCTRL {
    private static Http http = new Http();
    private static Google_Auth_Setting__c oathSetting = Google_Auth_Setting__c.getOrgDefaults();


    @AuraEnabled
    public static Map<String,Object> getUserEvents(String accessToken,String refreshToken){
        try {
            HttpResponse res = sendToGoogle(accessToken);
            if(res.getStatusCode() == 200){
                Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                return result;
            }else if(res.getStatusCode() == 401){
                Map<String,Object> newToken = getNewAccessToken(refreshToken);
                HttpResponse response = sendToGoogle((String)newToken.get('access_token'));
                if(response.getStatusCode() == 200){
                    return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                }else{
                    return null;
                }
            }else {
                return null;
            }
        } catch (Exception e) {
            throw new AuraHandledException('error: '+e.getMessage() +' at line: '+e.getLineNumber());
        }
    }
    private static HttpResponse sendToGoogle(String accessToken){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://www.googleapis.com/calendar/v3/calendars/primary/events');
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        HttpResponse res = http.send(req);
        return res;
    }
    private static Map<String,Object> getNewAccessToken(String refreshToken){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://oauth2.googleapis.com/token');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setBody(
            'client_id='+oathSetting.Client_Id__c +
            '&client_secret='+oathSetting.Client_Secret__c +
            '&refresh_token='+refreshToken +
            '&grant_type=refresh_token'
        );
        HttpResponse res = http.send(req);
        if(res.getStatusCode() == 200){
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            saveTokenInSF(result);
            return result;
        }else{
            return null;
        }
    }
    @AuraEnabled
    public static String getGoogleAuthUrl() {
        try {
            String redirectUri  = 'https://curious-badger-l52n6g-dev-ed.trailblaze.my.site.com/googleauth'; 
            String scope        = 'https://www.googleapis.com/auth/calendar';
            String responseType = 'code';
            
            String authUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
                '?client_id=' + EncodingUtil.urlEncode(oathSetting.Client_Id__c, 'UTF-8') +
                '&redirect_uri=' + EncodingUtil.urlEncode(redirectUri, 'UTF-8') +
                '&response_type=' + responseType +
                '&scope=' + EncodingUtil.urlEncode(scope, 'UTF-8') +
                '&access_type=offline' +
                '&prompt=consent';
            
            return authUrl;
        } catch (Exception e) {
            throw new AuraHandledException('error: '+e.getMessage() +' at line: '+e.getLineNumber());
        }
    }
    @AuraEnabled
    public static  String getAccessToken(String code){
        try {
            String redirectUri  = 'https://curious-badger-l52n6g-dev-ed.trailblaze.my.site.com/googleauth';
            HttpRequest req = new HttpRequest();
            String body ='code=' + EncodingUtil.urlEncode(code, 'UTF-8')
             +'&client_id=' +EncodingUtil.urlEncode(oathSetting.Client_Id__c, 'UTF-8') 
             +'&client_secret='+EncodingUtil.urlEncode(oathSetting.Client_Secret__c, 'UTF-8')
             +'&redirect_uri='+EncodingUtil.urlEncode(redirectUri, 'UTF-8')
             +'&grant_type=authorization_code';

            req.setEndpoint('https://oauth2.googleapis.com/token');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.setBody(body);
            HttpResponse res = http.send(req);
            if(res.getStatusCode() == 200){
                Id currentUserId = UserInfo.getUserId();
                Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                saveTokenInSF(result);
                return (String)result.get('access_token');
            }else{
                return null;
            }
        } catch (Exception e) {
            throw new AuraHandledException('error: '+e.getMessage() +' at line: '+e.getLineNumber());
        }
    }
    private static void saveTokenInSF(Map<String, Object> resultObj){
        Id currentUserId = UserInfo.getUserId();
        List<User_Access_Token__c> userAccessToken = [SELECT Id,Access_Token__c,Refresh_Token__c FROM User_Access_Token__c WHERE User__c =: currentUserId LIMIT 1];
        if(userAccessToken.size() > 0){
            userAccessToken[0].Access_Token__c = (String)resultObj.get('access_token');
            userAccessToken[0].Refresh_Token__c = resultObj.containsKey('refresh_token') ? (String)resultObj.get('refresh_token') : '';
            update userAccessToken[0];
        }else{
            User_Access_Token__c accessToken = new User_Access_Token__c(
                User__c = currentUserId,
                Access_Token__c = (String)resultObj.get('access_token'),
                Refresh_Token__c = (String)resultObj.get('refresh_token')
            );
            insert accessToken;
        }
    }
    @AuraEnabled
    public static User_Access_Token__c getUserAccessToken(){
        try {
            Id currentUserId = UserInfo.getUserId();
            List<User_Access_Token__c> userAccessToken = [SELECT Id,Access_Token__c,Refresh_Token__c,User__r.Name FROM User_Access_Token__c WHERE User__c =: currentUserId LIMIT 1];
            return (userAccessToken.size() > 0) ? userAccessToken[0] : null;
        } catch (Exception e) {
            throw new AuraHandledException('error: '+e.getMessage() +' at line: '+e.getLineNumber());
        }
    }
    public static void makeCallout(){
        // Http http = new Http();
        // HttpRequest req = new HttpRequest();
        // req.setEndpoint('callout:Google_Calendar_Cred/calendar/v3/calendars/primary/events');
        // req.setMethod('GET');
        // HttpResponse res = http.send(req);
        // System.debug('response 31 : '+res.getBody());


        // Http http = new Http();
        // HttpRequest req = new HttpRequest();
        // req.setEndpoint('https://oauth2.googleapis.com/token');
        // req.setMethod('POST');
        // req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        // String body = 
        //     'code=' + EncodingUtil.urlEncode(authCode, 'UTF-8') +
        //     '&client_id=' + CLIENT_ID +
        //     '&client_secret=' + CLIENT_SECRET +
        //     '&redirect_uri=' + EncodingUtil.urlEncode(redirectUri, 'UTF-8') +
        //     '&grant_type=authorization_code';

        // req.setBody(body);

        // HttpResponse res = http.send(req);
        // System.debug(res.getBody());

        Event__c event = [SELECT Id,Description__c,Event_Name__c,Start_Date__c,End_Date__c FROM Event__c LIMIT 1];
        Organization orgInfo = [SELECT TimeZoneSidKey FROM Organization LIMIT 1];
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Google_Calendar_Cred/calendar/v3/calendars/primary/events');
        req.setMethod('POST');
        Map<String,String> mapEndDate = new Map<String,String>{
            // 'date'=> String.valueOf(event.End_Date__c.date()),
            'dateTime'=> String.valueOf(event.End_Date__c),
            'timeZone'=> orgInfo.TimeZoneSidKey
        };
        Map<String,String> mapStartDate = new Map<String,String>{
            // 'date'=> String.valueOf(event.Start_Date__c.date()),
            'dateTime'=> String.valueOf(event.Start_Date__c),
            'timeZone'=> orgInfo.TimeZoneSidKey
        };
        Map<String, Object> payload = new Map<String, Object>{
            'end' => mapEndDate,
            'start' => mapStartDate,
            'summary' => event.Event_Name__c,
            'description' => event.Description__c
        };
        req.setBody(JSON.serialize(payload));
        HttpResponse res = http.send(req);
        System.debug('Google response 66 : ' + res.getBody());
    }
}