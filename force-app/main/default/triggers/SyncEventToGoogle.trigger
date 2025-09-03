trigger SyncEventToGoogle on Event__c (after insert,after update) {
    SyncEventToGoogleHandler.runTrigger(Trigger.isUpdate, Trigger.isAfter,Trigger.isBefore, Trigger.isInsert,Trigger.new,Trigger.old,Trigger.NewMap,Trigger.OldMap);
}