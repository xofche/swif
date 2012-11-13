/******************************************
* User Model
*/
openstm.Models.User = Backbone.Model.extend({

    // Model name in the database //
    model_name : 'res.users',

    defaults: {
        uid             : '',
        login           : '',
        sessionID       : '',
        lastConnection  : '',
        firstname       : '',
        lastname        : ''
    },

    initialize: function(){
        console.log('User initialize: ' + this.getLogin());
    },

    getUID : function() {
        return this.get('uid');
    },
    setUID : function(value) {
        this.set({ uid : value });
    },

    getLogin : function() {
        return this.get('login');
    },
    setLogin : function(value) {
        this.set({ login : value });
    },

    getFirstname : function() {
        return this.get('firstname');
    },
    setFirstname : function(value) {
        this.set({ firstname : _.capitalize(value) });
    },

    getLastname : function() {
        return this.get('lastname');
    },
    setLastname : function(value) {
        this.set({ lastname : value.toUpperCase() });
    },

    getFullname : function() {
        return this.get('firstname')+' '+this.get('lastname');
    },

    getSessionID : function() {
        return this.get('sessionID');
    },
    setSessionID : function(value) {
        this.set({ sessionID : value });
    },

    getLastConnection : function() {
        return this.get('lastConnection');
    },
    setLastConnection : function(value) {
        this.set({ lastConnection : value });
    },

    destroySessionID: function(){
        this.setSessionID('');
    },

    hasSessionID: function(){
        if(this.getSessionID() != ''){
            return true;
        }
        else{
            return false;
        }
    },



    /** Login function
    */
    login: function(loginUser, passUser){

        "use strict";
        var self = this;

        console.log('Login User: ' + loginUser + ' - ' + passUser);

        var deferred = $.Deferred();

        openstm.json(openstm.urlOE+openstm.urlOE_authentication, {
            'base_location': openstm.urlOpenERP,
            'db': openstm.userBDD,
            'login': loginUser,
            'password': passUser,
            'session_id': ''
        })
        .fail(function (error){
            openstm.notify('large', 'error', openstm.lang.errorMessages.connectionError, openstm.lang.errorMessages.serverUnreachable);
        })
        .done(function (data) {

            console.debug(data);

            if(data.uid == false){
                openstm.notify('large', 'error', openstm.lang.errorMessages.connectionError, openstm.lang.errorMessages.loginIncorrect);
            }
            else{
                
                self.setUID(data.uid)
                self.setSessionID(data.session_id);
                self.setLogin(loginUser);
                self.setUID(data.uid);
                
                var date = moment().format("LLL");
                self.setLastConnection(date);
               
                // Add the user to the collection and save it to the localStorage //
                openstm.collections.users.add(self);

                // Get the user Information //
                self.getUserInformations();
                
                openstm.notify('', 'info', 'Information', 'Vous êtes connecté');
                
                Backbone.history.navigate(openstm.router.homePage, {trigger: true, replace: true});
                
        
                // Refresh the header //
                openstm.views.headerView.render(openstm.router.mainMenus.manageInterventions);
            }
            
            deferred.resolve();
        })
        .always(function(){
            // Remove the loader //
            openstm.loader('hide');
        })

       return deferred;
    },



    /** Logout fonction
    */
    logout: function(options){
        "use strict";
        var self = this;

        var deferred = $.Deferred();

        openstm.json(openstm.urlOE+openstm.urlOE_sessionDestroy, {
            'session_id': self.getSessionID()
        })
        .fail(function (){
            openstm.notify('', 'error', openstm.lang.errorMessages.connectionError, openstm.lang.errorMessages.serverUnreachable);
        })
        .done(function (data) {
            // On détruit la session dans le localStorage //
            self.destroySessionID();
            self.save();
            
            
            openstm.notify('large', 'info', openstm.lang.infoMessages.information, openstm.lang.infoMessages.successLogout);

            // Refresh the header //
            openstm.views.headerView.render();

            // Navigate to the login Page //
            Backbone.history.navigate('login', {trigger: true, replace: true});
            deferred.resolve();
        });

       return deferred;
    },



    /** Get the menu of the user
    */
    getMenus: function(options){
        "use strict";
        var self = this;

        return openstm.json(openstm.urlOE+openstm.urlOE_menuUser, {
            'session_id': self.getSessionID()
        }, options)
    },



    /** Get the menu of the user
    */
    getUserInformations: function(options){
        "use strict";
        var self = this;

        openstm.json(openstm.urlOE + openstm.urlOE_readObject, {
            'model'     : self.model_name,
            'fields'    : ["firstname", "name"],
            'ids'       : [self.getUID()],
            'session_id': self.getSessionID()
        })
        .fail(function (){
           openstm.notify('', 'error', openstm.lang.errorMessages.connectionError, openstm.lang.errorMessages.serverUnreachable);
        })
        .done(function(data){

            // Retrieve the firstname and the lastname of the user //
            self.setFirstname(data[0].firstname);
            self.setLastname(data[0].name);
            self.save();

        });
       
    }



});

