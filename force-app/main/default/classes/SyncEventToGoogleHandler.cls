public with sharing class SyncEventToGoogleHandler {
    public static void runTrigger(Boolean isUpdate,Boolean isAfter,Boolean isBefore, Boolean isInsert,List<Event__c> listEvent,List<Event__c> listOldEvent,Map<Id,Event__c> mapNewEvent,Map<Id,Event__c> mapOldEvent){
        if((isUpdate || isInsert) && isAfter ){
            afterInsertUpdateProcess(listEvent);
        }
    }
    private static void afterInsertUpdateProcess(List<Event__c> listEvent){
        System.enqueueJob(new sendToGoogleQueueable(listEvent));
    }
    public class sendToGoogleQueueable implements Queueable, Database.AllowsCallouts{
        private List<Event__c> listEvent;
        public sendToGoogleQueueable(List<Event__c> listEventParam) {
            this.listEvent = listEventParam;
        }
        public void execute(QueueableContext context) {
            Http http = new Http();
            Organization orgInfo = [SELECT TimeZoneSidKey FROM Organization LIMIT 1];
            for(Event__c event:listEvent){
                HttpRequest req = new HttpRequest();
                req.setEndpoint('callout:Google_Calendar_Cred/calendar/v3/calendars/primary/events');
                req.setMethod('POST');
                req.setHeader('Content-Type', 'application/json');
                Map<String,Object> mapEndDate = new Map<String,Object>{
                    // 'date'=> String.valueOf(event.End_Date__c.date()),
                    'dateTime'=> event.End_Date__c,
                    'timeZone'=> orgInfo.TimeZoneSidKey
                };
                Map<String,Object> mapStartDate = new Map<String,Object>{
                    // 'date'=> String.valueOf(event.Start_Date__c.date()),
                    'dateTime'=> event.Start_Date__c,
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
                System.debug('Google response 41 : ' + res);
            }
        }
    }
}