public with sharing class SyncEventToGoogleHandler {
    private static Http http = new Http();
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
        private String googleEventStr;
        public sendToGoogleQueueable(List<Event__c> listEventParam) {
            this.listEvent = listEventParam;
        }
        public void execute(QueueableContext context) {
            Organization orgInfo = [SELECT TimeZoneSidKey FROM Organization LIMIT 1];
            Map<String,Map<String,Object>> mapGoogleEvent = getGoogleEventHTTP();
            for(Event__c event:listEvent){
                if(mapGoogleEvent.containsKey(event.Event_Name__c)){
                    Map<String,Object> mapEvent = mapGoogleEvent.get(event.Event_Name__c);
                    Map<String,Object> mapEndDate = (Map<String,Object>)mapEvent.get('end');
                    Map<String,Object> mapStartDate = (Map<String,Object>)mapEvent.get('start');
                    String endDateStr = (String) mapEndDate.get('dateTime');
                    String startDateStr = (String) mapStartDate.get('dateTime');
                    DateTime endDate = (DateTime) JSON.deserialize('"' + endDateStr + '"', DateTime.class);
                    DateTime startDate = (DateTime) JSON.deserialize('"' + startDateStr + '"', DateTime.class);

                    if(endDate != event.End_Date__c && startDate != event.Start_Date__c){
                        sendToGoogleHTTP(event,orgInfo.TimeZoneSidKey);
                    }
                }else{
                    sendToGoogleHTTP(event,orgInfo.TimeZoneSidKey);
                }
            }
        }
    }
    private static void sendToGoogleHTTP(Event__c event,String timezoneKey){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Google_Calendar_Cred/calendar/v3/calendars/primary/events');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        Map<String,Object> mapEndDate = new Map<String,Object>{
            // 'date'=> String.valueOf(event.End_Date__c.date()),
            'dateTime'=> event.End_Date__c,
            'timeZone'=> timezoneKey
        };
        Map<String,Object> mapStartDate = new Map<String,Object>{
            // 'date'=> String.valueOf(event.Start_Date__c.date()),
            'dateTime'=> event.Start_Date__c,
            'timeZone'=> timezoneKey
        };
        Map<String, Object> payload = new Map<String, Object>{
            'end' => mapEndDate,
            'start' => mapStartDate,
            'summary' => event.Event_Name__c,
            'description' => event.Description__c
        };
        req.setBody(JSON.serialize(payload));
        HttpResponse res = http.send(req);
        System.debug('Google response 41 : ' + res.getBody());
    }
    private static Map<String,Map<String,Object>> getGoogleEventHTTP(){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Google_Calendar_Cred/calendar/v3/calendars/primary/events');
        req.setMethod('GET');
        HttpResponse res = http.send(req);
        Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        List<Object> listGoogleEvent = (List<Object>)result.get('items');
        Map<String,Map<String,Object>> mapGoogleEvent = new Map<String,Map<String,Object>>();
        if(listGoogleEvent.size() > 0){  
            for(Object obj:listGoogleEvent){
                Map<String,Object> mapObject = (Map<String,Object>)obj;
                Map<String,Object> mapEvent = new Map<String,Object>{
                    'end' => mapObject.get('end'),
                    'start' => mapObject.get('start')
                };
                mapGoogleEvent.put((String)mapObject.get('summary'),mapEvent);
            }
        }
        return mapGoogleEvent;
    }
}