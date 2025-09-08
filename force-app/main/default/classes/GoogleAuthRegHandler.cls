global with sharing class GoogleAuthRegHandler implements Auth.RegistrationHandler{
    global User createUser(Id portalId, Auth.UserData data){
        List<User> user = [SELECT Id FROM User WHERE Email =:data.email LIMIT 1];
        if(user.size() > 0){
            return user[0];
        }
        if(data.attributeMap.containsKey('sfdc_networkid')) {
            //We have a community id, so create a user with community access
            //TODO: Get an actual account
            Id RecordTypeIdPersonAccount = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Person Account').getRecordTypeId();
            Account acct                               = new Account();
            acct.RecordTypeId                          = RecordTypeIdPersonAccount;
            acct.FirstName                             = data.firstName;
            acct.LastName                              = data.lastName;
            acct.PersonEmail                           = data.email;
            insert acct;   
            List<Account> accliststs = [SELECT Id,Name,PersonContactId FROM Account WHERE Id =:acct.Id]; 


            //TODO: Customize the username and profile. Also check that the username doesn't already exist and
            //possibly ensure there are enough org licenses to create a user. Must be 80 characters or less.
            Integer randomId    = Integer.valueOf(Math.rint(Math.random()*1000000)); 
            User u = new User();
            Profile p = [SELECT Id FROM profile WHERE name='External User'];
            u.username = data.username + randomId + '@noynoycorp.com';
            u.email = data.email;
            u.lastName = data.lastName;
            u.firstName = data.firstName;
            String alias = data.username;
            //Alias must be 8 characters or less
            if(alias.length() > 8) {
                alias = alias.substring(0, 8);
            }
            u.alias = alias;
            u.languagelocalekey = UserInfo.getLocale();
            u.localesidkey = UserInfo.getLocale();
            u.emailEncodingKey = 'UTF-8';
            u.timeZoneSidKey = 'America/Los_Angeles';
            u.profileId = p.Id;
            u.contactId = accliststs[0].PersonContactId;
            return u;
        } else {
            return null;
        }
    }
    global void updateUser(Id userId, Id portalId, Auth.UserData data){
        // User u = new User(id=userId);
        // //TODO: Customize the username. Must be 80 characters or less.
        // //u.username = data.username + '@myorg.com';
        // u.email = data.email;
        // u.lastName = data.lastName;
        // u.firstName = data.firstName;
        // //String alias = data.username;
        // //Alias must be 8 characters or less
        // //if(alias.length() > 8) {
        //     //alias = alias.substring(0, 8);
        // //}
        // //u.alias = alias;
        // update(u);
    }
}