public with sharing class testDeclarationCTRL {
    @AuraEnabled
    public static Declaration__c getDeclaration(String apiName){
        try {
            if(String.isNotBlank(apiName)){
                List<Declaration__c> declaration = [SELECT Id,
                                                    AS_Active__c,
                                                    AS_Declaration_API_Name__c,
                                                    AS_Declaration_Details_URL__c,
                                                    Name,
                                                    Declaration_Summary__c,
                                                    Required_File_Upload__c 
                                                    FROM Declaration__c 
                                                    WHERE AS_Declaration_API_Name__c =: apiName LIMIT 1];

                return declaration.size() > 0 ? declaration[0] : null;
            }else{
                return null;
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static User_Declarations__c getUserDeclaration(String declarationId){
        try {
            String accountId = getUserData().AccountId;
            List<User_Declarations__c> userDeclaration = [SELECT Id,AS_Account_Name__c,AS_Declaration_Date__c FROM User_Declarations__c WHERE AS_Declaration_Name__c =:declarationId AND AS_Account_Name__c =:accountId];
            if(userDeclaration.size() > 0){
                return userDeclaration[0];
            }else{
                return null;
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static User_Declarations__c createUserDeclaration(String declarationId){
        try {
            String accountId = getUserData().AccountId;
            User_Declarations__c userDeclaration = new User_Declarations__c(
                AS_Account_Name__c = accountId,
                AS_Declaration_Name__c = declarationId,
                AS_Declaration_Date__c = System.now()
            );
            insert userDeclaration;
            return userDeclaration;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static User getUserData(){
        String loggedUserId = UserInfo.getUserId();
        User user=[SELECT Id,AccountId,ContactId FROM User WHERE Id=:loggedUserId];
        return user;
    }
}