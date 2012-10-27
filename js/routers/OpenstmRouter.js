/******************************************
* OpenSTM Router
*/
openstm.Router = Backbone.Router.extend({


    homePage : 'demandes-dinterventions',

    routes: {
        ''                                      : 'requestsList',
        'login'                                 : 'login',
        'logout'                                : 'logout',
        'about'                                 : 'about',
        'interventions'                         : 'interventions',
        'demandes-dinterventions'               : 'requestsList',
        'demandes-dinterventions/page/:page'    : 'requestsList',
        'demandes-dinterventions/add'           : 'addRequest',
        'demandes-dinterventions/:id'           : 'detailsRequest'
    },

    
    mainMenus: {
        manageInterventions        : 'gestion-des-interventions',
        reporting                  : 'reporting',
        configuration              : 'configuration'
    },


    /** Router Initialization
    */
    initialize: function () {

        // Header, Footer Initialize //
        openstm.views.headerView = new openstm.Views.HeaderView();
        openstm.views.footerView = new openstm.Views.FooterView();

    },



    /** Check if the User is connect
    */
    checkConnect: function(){

        console.log('### checkConnect Function ###');
        
        // Check if a user exist in localStorage //
        if (openstm.collections.users.length == 1){
            console.log('User in the localStorage');
            
            openstm.models.user = openstm.collections.users.at(0);

            // Check if a user has a sessionID //
            if(openstm.models.user.hasSessionID()){
                console.log('User is connect')
                return true;
            }
            else{
                console.log('User is not connect');
                return false;
            }
        }
        else{
            console.log('User NOT in the localStorage');

            return false;
        }
    },



    /** Change the Title of the page
    */
    setPageTitle: function(title){
        $(document).attr('title', title);
    },




    /******************************************
    * ROUTE FUNCTION
    */

    /*************Generiq****************/

    /** Display the login View
    */
    login: function(){
        // Check if the user is connect //
        if(!this.checkConnect()){

            // If the view exist we reuse it //
            if(openstm.views.loginView){
                openstm.views.loginView.render();
            }
            else{
                openstm.views.loginView = new openstm.Views.LoginView(openstm.models.user);
            }
        }
        else{
            this.navigate(this.homePage, {trigger: true, replace: true});
        }
    },


    /** Logout the user
    */
    logout: function(){
        openstm.models.user.logout();
        this.navigate('login', {trigger: true, replace: true});
    },


    /** About OpenSTM
    */
    about: function(){
        // Check if the user is connect //
        if(this.checkConnect()){

            // If the view exist we reuse it //
            if(openstm.views.aboutView) {
                openstm.views.aboutView.render();
            }
            else{
                openstm.views.aboutView = new openstm.Views.AboutView();
            }

        }
        else{
            this.navigate('login', {trigger: true, replace: true});
        }

    },




    /*************Request****************/
    
    /** Requests List
    */
    requestsList: function(page) {

        // Check if the user is connect //
        if(this.checkConnect()){
           
            self.p = page ? parseInt(page, 10) : 1;         

            // Check if the collections is instantiate //
            if(openstm.collections.requests == null ){
                openstm.collections.requests = new openstm.Collections.Requests();
            }

            openstm.collections.requests.fetch({success: function(){
            
                if(openstm.views.requestsListView == null) {
                    openstm.views.requestsListView = new openstm.Views.RequestsListView({page: self.p});
                } 
                else {
                    openstm.views.requestsListView.options.page = self.p;
                    openstm.views.requestsListView.initialize();             
                }

            }});
        }
        else{
            this.navigate('login', {trigger: true, replace: true});
        }
    },


    /** Request Details
    */
    detailsRequest: function (id) {
        
        // Check if the user is connect //
        if(this.checkConnect()){
        	
        	var self = this;
        	var request = openstm.collections.requests.get(id);

            if(openstm.collections.places == null ){
                openstm.collections.places = new openstm.Collections.Places();
            }

            self.request = request;
            openstm.collections.places.fetch({success: function(){
            
                if(openstm.views.requestsDetailsView == null) {
                    openstm.views.requestsDetailsView = new openstm.Views.RequestDetailsView({model: self.request}, false);
                } 
                else {
                    openstm.views.requestsDetailsView.initialize();             
                }

            }});        	

        }
        else{
            this.navigate('login', {trigger: true, replace: true});
        }
    },
    

    /** Add Request
    */
    addRequest: function() {
        
        // Check if the user is connect //
        if(this.checkConnect()){
            var request = new openstm.Models.Request();
            
            // Check if the requestView already exist //
            if(openstm.views.requestView == null) {          
                openstm.views.requestView = new openstm.Views.RequestDetailsView({model: request}, true);  
            }
            else{
                openstm.views.requestView.model = request;
                openstm.views.requestView.initialize(request,true);
            }
        }
        else{
            this.navigate('login', {trigger: true, replace: true});
        }
    },





    /** Interventions OpenSTM
    */
    interventions: function(){
        // Check if the user is connect //
        if(this.checkConnect()){

            // If the view exist we reuse it //
            if(openstm.views.interventionsView){
                openstm.views.interventionsView.render();
            }
            else{
                openstm.views.interventionsView = new openstm.Views.InterventionsView();
            }
        }
        else{
            this.navigate('login', {trigger: true, replace: true});
        }
    }






});