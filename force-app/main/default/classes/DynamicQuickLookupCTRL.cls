public with sharing class DynamicQuickLookupCTRL {
    @AuraEnabled
    public static List<Object> getRecords(String queryStr){
        try {
            // String query = 'SELECT '+fieldToSearch + ' FROM '+objectAPIName + ' WHERE ';
            // query += fieldToSearch+' LIKE \'%'+filterValue+'%\'';
            // if(String.isNotBlank(whereClause)){
            //     query += ' AND '+whereClause;
            // }
            return Database.query(queryStr);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Map<String,Object> getDefaultRecord(String jsonData){
        try {
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(jsonData);
            String parentObjectAPI = data.containsKey('parentObjectAPI') ? (String.isNotBlank( (String) data.get('parentObjectAPI')) ? (String) data.get('parentObjectAPI') :'') : '';
            String childObjectAPI = data.containsKey('childObjectAPI') ? (String.isNotBlank( (String) data.get('childObjectAPI')) ? (String) data.get('childObjectAPI') :'') : '';
            String parentFieldToSearch = data.containsKey('parentFieldToSearch') ? (String.isNotBlank( (String) data.get('parentFieldToSearch')) ? (String) data.get('parentFieldToSearch') :'') : '';
            String childFieldToSearch = data.containsKey('childFieldToSearch') ? (String.isNotBlank( (String) data.get('childFieldToSearch')) ? (String) data.get('childFieldToSearch') :'') : '';
            String parentId = data.containsKey('defaultParentId') ? (String.isNotBlank( (String) data.get('defaultParentId')) ? (String) data.get('defaultParentId') :'') : '';
            String childId = data.containsKey('defaultChildId') ? (String.isNotBlank( (String) data.get('defaultChildId')) ? (String) data.get('defaultChildId') :'') : '';
            String query = '';
            Map<String,Object> returnMap = new Map<String,Object>();
            if(String.isNotBlank(parentObjectAPI) && String.isNotBlank(childObjectAPI) && String.isNotBlank(parentFieldToSearch) && String.isNotBlank(childFieldToSearch) && String.isNotBlank(parentId) && String.isNotBlank(childId)){
                String parentQuery = 'SELECT '+parentFieldToSearch +' FROM '+parentObjectAPI + ' WHERE Id =:parentId';
                returnMap.put(parentObjectAPI,Database.query(parentQuery));
                String childQuery = 'SELECT '+childFieldToSearch+ ' FROM '+childObjectAPI+' WHERE Id =:childId';
                returnMap.put(childObjectAPI,Database.query(childQuery));
            }
            return returnMap;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}