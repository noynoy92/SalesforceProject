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
    public static List<Object> getDefaultRecord(String objectAPIName,String fieldToSearch,String recordId){
        try {
            String query = 'SELECT '+fieldToSearch + 'FROM '+objectAPIName +'WHERE Id =: recordId';
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}