public with sharing class DynamicRecordCreationCTRL {
    @AuraEnabled
    public static List<Map<String,String>> getAllObject(String objectList){
        try {
            List<Map<String,String>> mapObject = new List<Map<String,String>>();

            List<String> listObject = objectList.split(',');
            for(String str:listObject){
                Map<String,String> singleObjRecord = new Map<String,String>();
                Schema.SObjectType objType = Schema.getGlobalDescribe().get(str);
                Schema.DescribeSObjectResult describeResult = objType.getDescribe();
                singleObjRecord.put('value',describeResult.getName());
                singleObjRecord.put('label',describeResult.getLabel()); 
                mapObject.add(singleObjRecord);
            }
            return mapObject;
        } catch (Exception e) {
            throw new AuraHandledException('error: '+e.getMessage()+'at line: '+e.getLineNumber());
        }
    }
    @AuraEnabled
    public static Map<String,Object> getFieldSetField(String objectName,String namingConvention){
        try {
            Map<String,Object> returnMap = new Map<String,Object>();
            List<String> fieldList = new List<String>();
            Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
            Schema.SObjectType objType = gd.get(objectName);
            Schema.DescribeSObjectResult describeResult = objType.getDescribe();
            // Get all field sets
            Map<String, Schema.FieldSet> fieldSets = describeResult.fieldSets.getMap();
            String fieldSetApiName = '';
            for (String fsName : fieldSets.keySet()) { 
                if(fsName.contains(namingConvention.toLowerCase())){
                    List<Schema.FieldSetMember> fields = fieldSets.get(fsName).getFields();
                    for (Schema.FieldSetMember f : fields) {
                        fieldList.add(f.getFieldPath());
                    } 
                }       
            }
            returnMap.put('fields',fieldList);
            returnMap.put('objectLabel',describeResult.getLabel());
            return returnMap;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}