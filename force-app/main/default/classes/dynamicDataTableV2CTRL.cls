public without sharing class dynamicDataTableV2CTRL {

    @AuraEnabled
    public static Map<String,Object> getRecords(String objectName,String fieldSet,String whereClause,String exportFieldSet){
        try {
            Map<String,Object> returnMap = new Map<String,Object>();
            // List<String> fieldPaths = new List<String>();

            // // Step 1: Get the global describe map
            // Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

            // // Step 2: Check if object exists
            // if (!globalDescribe.containsKey(objectName)) {
            //     throw new AuraHandledException('Object not found: ' + objectName);
            // }

            // Schema.SObjectType sObjectType = globalDescribe.get(objectName);
            // Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();


            // // Step 3: Get field sets map
            // Map<String, Schema.FieldSet> fieldSetMap = describeResult.fieldSets.getMap();

            // // Step 4: Check if field set exists
            // if (!fieldSetMap.containsKey(fieldSet)) {
            //     throw new AuraHandledException('Field set not found: ' + fieldSet);
            // }

            // List<Schema.FieldSetMember> fields = fieldSetMap.get(fieldSet).getFields();
            // List<Map<String,Object>> fieldInfo = new List<Map<String,Object>>();

            // Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

            // // Step 5: Extract field API names
            // for (Schema.FieldSetMember member : fields) {
            //     Map<String,Object> field = new Map<String,Object>();
            //     field.put('label',member.getLabel());
            //     field.put('fieldName',member.getFieldPath());
            //     field.put('fieldType',String.valueOf(member.getType()));
            //     if(fieldMap.containsKey(member.getFieldPath())){
            //         Schema.DescribeFieldResult describe = fieldMap.get(member.getFieldPath()).getDescribe();
            //         field.put('isFormula',describe.isCalculated());
            //     }
            //     fieldInfo.add(field);
            //     fieldPaths.add(member.getFieldPath());
            // }

            Map<String,Object> fieldSetInfos = getFieldSetInfo(objectName,fieldSet);
            List<Map<String,Object>> fieldInfo = (List<Map<String,Object>>)fieldSetInfos.get('fieldInfo');
            List<String> fieldPaths = (List<String>)fieldSetInfos.get('fieldPaths');
            Map<String,Object> exportFieldSetInfos = getFieldSetInfo(objectName,exportFieldSet);
            List<String> exportFieldPaths = (List<String>)exportFieldSetInfos.get('fieldPaths');

            // String query = 'SELECT ' + String.join(fieldPaths, ',') + ' FROM '+objectName;
            // if(String.isNotBlank(whereClause)){
            //     if(whereClause.contains('accId')){
            //         String accountId = getUserData().AccountId;
            //         whereClause = whereClause.replace('accId', '\''+accountId+'\'' );
            //     }
            //     query += ' WHERE '+whereClause;
            // }
            // List<SObject> records = Database.query(query);
            Organization org = [SELECT TimeZoneSidKey FROM Organization LIMIT 1];
            // TimeZone tz = UserInfo.getTimeZone();
            String query = 'SELECT ' + String.join(fieldPaths, ',') + ' FROM '+objectName;
            List<SObject> records = queryRecords(objectName,fieldPaths,whereClause);
            List<SObject> exportRecords = queryRecords(objectName,exportFieldPaths,whereClause);
            returnMap.put('query',query);
            returnMap.put('records',records);
            returnMap.put('timeZoneId',org.TimeZoneSidKey);
            returnMap.put('fieldInfos',fieldInfo);
            exportFieldPaths.add('Id');
            returnMap.put('stringCSV',generateCSV(exportRecords,exportFieldPaths,objectName));
            return returnMap;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage() + ' at line: '+e.getLineNumber());
        }
    }
    private static List<SObject> queryRecords(String objectName,List<String> fieldPaths,String whereClause){
        String query = 'SELECT ' + String.join(fieldPaths, ',') + ' FROM '+objectName;
        if(String.isNotBlank(whereClause)){
            if(whereClause.contains('accId')){
                String accountId = getUserData().AccountId;
                whereClause = whereClause.replace('accId', '\''+accountId+'\'' );
            }
            query += ' WHERE '+whereClause;
        }
        List<SObject> records = Database.query(query);
        return records;
    }
    public static Map<String,Object> getFieldSetInfo(String objectName,String fieldSet){
        Map<String,Object> returnMap = new Map<String,Object>();
        List<String> fieldPaths = new List<String>();

        // Step 1: Get the global describe map
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

        // Step 2: Check if object exists
        if (!globalDescribe.containsKey(objectName)) {
            throw new AuraHandledException('Object not found: ' + objectName);
        }

        Schema.SObjectType sObjectType = globalDescribe.get(objectName);
        Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();


        // Step 3: Get field sets map
        Map<String, Schema.FieldSet> fieldSetMap = describeResult.fieldSets.getMap();

        // Step 4: Check if field set exists
        if (!fieldSetMap.containsKey(fieldSet)) {
            throw new AuraHandledException('Field set not found: ' + fieldSet);
        }

        List<Schema.FieldSetMember> fields = fieldSetMap.get(fieldSet).getFields();
        List<Map<String,Object>> fieldInfo = new List<Map<String,Object>>();

        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

        // Step 5: Extract field API names
        for (Schema.FieldSetMember member : fields) {
            Map<String,Object> field = new Map<String,Object>();
            field.put('label',member.getLabel());
            field.put('fieldName',member.getFieldPath());
            field.put('fieldType',String.valueOf(member.getType()));
            if(fieldMap.containsKey(member.getFieldPath())){
                // Boolean isEditable = objectFieldsMap.get(fieldName).getDescribe().isUpdateable();
                Schema.DescribeFieldResult describe = fieldMap.get(member.getFieldPath()).getDescribe();
                field.put('isFormula',describe.isCalculated());
                field.put('isEditable',describe.isUpdateable());
            }
            fieldInfo.add(field);
            fieldPaths.add(member.getFieldPath());
        }
        returnMap.put('fieldInfo', fieldInfo);
        returnMap.put('fieldPaths', fieldPaths);
        return returnMap;
    }
    private static User getUserData(){
        String loggedUserId = UserInfo.getUserId();
        User user=[select Id,AccountId,ContactId from User where Id=:loggedUserId];
        return user;
    }
    public static String generateCSV(List<SObject> records, List<String> fieldNames,String objectName) {
        if (records.isEmpty() || fieldNames.isEmpty()) return '';

        String csv = String.join(fieldNames, ',') + '\n';
        Map<String, Schema.SObjectField> objectFieldsMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        for (SObject record : records) {
            List<String> rowValues = new List<String>();

            for (String field : fieldNames) {
                Object value = record.get(field);
                String fieldType = String.valueOf(objectFieldsMap.get(field).getDescribe().getType());
                if(String.isNotBlank(String.valueOf(value))){
                    if(fieldType == 'DATETIME'){
                        DateTime dt = DateTime.valueOf(record.get(field));
                        String isoString = dt.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
                        value = isoString;
                    }
                }
                String valStr = value != null ? String.valueOf(value).replaceAll('"', '""') : '';
                rowValues.add('"' + valStr + '"');
            }
            csv += String.join(rowValues, ',') + '\n';
        }

        return csv;
    }
    @AuraEnabled
    public static string saveCSV(String csvRecords,String objectName){
        try {    
            Map<String, Schema.SObjectField> objectFieldsMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();       
            Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
            List<SObject> newRecords = new List<SObject>();
            List<Object> data= (List<Object>) JSON.deserializeUntyped(csvRecords);
            for(Object obj:data){
                Map<String, Object> datarec = (Map<String,Object>) JSON.deserializeUntyped(JSON.serialize(obj));
                SObject sObj = sObjectType.newSObject();
                for (String fieldName : datarec.keySet()) {
                    String fieldType = String.valueOf(objectFieldsMap.get(fieldName).getDescribe().getType());
                    Boolean isFormula = objectFieldsMap.get(fieldName).getDescribe().isCalculated();
                    Boolean isEditable = objectFieldsMap.get(fieldName).getDescribe().isUpdateable();
                    if(!isFormula && isEditable){
                        switch on fieldType {
                            when 'DOUBLE' {
                                sObj.put(fieldName,Double.valueOf(datarec.get(fieldName)));
                            }when 'DATE' {
                                if(String.isNotBlank(String.valueOf(datarec.get(fieldName)))) {
                                    String originalStr = String.valueOf(datarec.get(fieldName));
                                    Integer spaceIndex = originalStr.indexOf(' ');
                                    String result = (spaceIndex > -1) ? originalStr.substring(0, spaceIndex) : originalStr;
                                    
                                    List<String> datefrag = result.split('/');
                                    sObj.put(fieldName,Date.newInstance(Integer.valueOf(datefrag[2]), Integer.valueOf(datefrag[1]), Integer.valueOf(datefrag[0])));
                                }
                            }when 'BOOLEAN' {
                                sObj.put(fieldName,Boolean.valueOf(datarec.get(fieldName)));
                            }when 'DATETIME' {
                                String dateStr = String.valueOf(datarec.get(fieldName));
                                if(String.isNotBlank(dateStr)){
                                    if(dateStr.contains('T')){
                                        dateStr = dateStr.replace('T', ' ');
                                    }
                                    if(dateStr.contains('Z')){
                                        dateStr = dateStr.replace('Z', '');
                                    }
                                    DateTime dt = Datetime.valueOf(dateStr);
                                    DateTime outputDT = DateTime.newInstance(dt.year(), dt.month(), dt.day(), dt.hour(), dt.minute(), dt.second());
                                    sObj.put(fieldName,outputDT);
                                }
                            }
                            when else {
                                sObj.put(fieldName,String.valueOf(datarec.get(fieldName)));
                            }
                        }
                    }
                }
                newRecords.add(sObj);
            }
            insert newRecords;
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage() + ' at line: '+e.getLineNumber());
        }
    }
}