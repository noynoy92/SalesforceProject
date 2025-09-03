public with sharing class googleCalendarCMPCTRL {
    @AuraEnabled
    public static Map<String,Object> getUserEvents(){
        try {
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:Google_Calendar_Cred/calendar/v3/calendars/primary/events');
            req.setMethod('GET');
            HttpResponse res = http.send(req);
            return new Map<String,Object>{'result'=> res.getBody()};
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
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
        System.debug('Google response 66 : ' + res);
    }
}