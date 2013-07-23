/******************************************
 * User Model
 */
app.Models.User = Backbone.Model.extend({

    // Model name in the database //
    model_name: 'res.users',
    url: '/api/open_object/users',

    relations: [
        {
            type: Backbone.HasMany,
            key: 'service_ids',
            relatedModel: 'app.Models.ClaimerService',
            reverseRelation: {
                type: Backbone.HasMany,
                key: 'users',
                includeInJSON: ['id', 'name'],
            }
        },
        {
            type: Backbone.HasMany,
            key: 'officers',
            relatedModel: 'app.Models.Officer',
            includeInJSON: ['id', 'firstname', 'name'],
        },

    ],

    defaults: {
        uid: '',
        login: '',
        sessionID: '',
        lastConnection: '',
        firstname: '',
        lastname: '',
        service_ids: [],
        context: {},
        officers: [],
        teams: [],
        isDST: false,
        isManager: false
    },

    initialize: function () {
        console.log('User initialize: ' + this.getLogin());
    },

    /** Model Parser */
    parse: function (response) {
        return response;
    },

    getUID: function () {
        return this.get('uid');
    },
    setUID: function (value) {
        this.set({ uid: value });
    },

    getGroups: function () {
        return this.get('groupsID');
    },
    setGroups: function (value) {
        this.set({ groupsID: value });
    },

    getLogin: function () {
        return this.get('login');
    },
    setLogin: function (value) {
        this.set({ login: value });
    },

    getFirstname: function () {
        return this.get('firstname');
    },
    setFirstname: function (value) {
        this.set({ firstname: _.capitalize(value) });
    },

    getLastname: function () {
        return this.get('lastname');
    },
    setLastname: function (value) {
        this.set({ lastname: value.toUpperCase() });
    },

    getFullname: function () {
        return this.get('firstname') + ' ' + this.get('lastname');
    },

    getSessionID: function () {
        return this.get('sessionID');
    },
    setSessionID: function (value) {
        this.set({ sessionID: value });
    },

    getLastConnection: function () {
        return this.get('lastConnection');
    },
    setLastConnection: function (value) {
        this.set({ lastConnection: value });
    },

    destroySessionID: function () {
        this.setSessionID('');
    },

    hasSessionID: function () {
        if (this.getSessionID() != '') {
            return true;
        }
        else {
            return false;
        }
    },

    getService: function () {
        return this.get('service_id');
    },
    setService: function (value) {
        this.set({ service_id: value });
    },

    getOfficers: function () {
        return this.get('officers');
    },

    setOfficers: function (value) {
        this.set({ officers: value });
    },

    getTeams: function () {
        return this.get('teams');
    },
    setTeams: function (value) {
        this.set({ teams: value });
    },

    getContact: function () {
        return this.get('contact_id');
    },
    setContact: function (value) {
        this.set({ contact_id: value });
    },

    getServices: function () {
        return this.get('service_ids');
    },
    setServices: function (value) {
        this.set({ service_ids: value });
    },

    getContext: function () {
        return this.get('context');
    },
    setContext: function (value) {
        this.set({ context: value });
    },

    isManager: function (value) {
        return this.get('isManager');
    },

    setManager: function (value) {
        this.set({ isManager: value });
    },

    isDST: function (value) {
        return this.get('isDST');
    },

    setDST: function (value) {
        this.set({ isDST: value });
    },

    setMenu: function (menu) {
        this.set({menu: menu});
    },


    /** get, by calling server, officers and teams to filter on it in tasks/planning screens
     */
    getTeamsAndOfficers: function () {
        var self = this

        $.ajax({
            url: app.config.barakafrites.url+self.url+'/'+this.get("uid")+'/manageable_teams',
            headers: {Authorization: 'Token token=' + self.get('authToken')},
            success: function (data) {
                self.setTeams(data)
            }
        });

        $.ajax({
            url: app.config.barakafrites.url+self.url+'/'+this.get("uid")+'/manageable_officers',
            headers: {Authorization: 'Token token=' + self.get('authToken')},
            success: function (data) {
                self.setOfficers(data)
            }
        })
        self.save();
    },


    /** Login function
     */
    login: function (loginUser, passUser) {

        "use strict";
        var self = this;

        console.log('Login User: ' + loginUser + ' - ' + passUser);

        var deferred = $.Deferred();
        var login_data = {
            'dbname': app.config.openerp.database,
            'login': loginUser,
            'password': passUser,
        };

        $.ajax(
            {
                url: app.config.barakafrites.url + '/sessions',
                type: "POST",
                data: JSON.stringify(login_data)
            }
        )
            .fail(function (error) {
                console.error(error);
                app.loader('hide');
                app.notify('large', 'error', app.lang.errorMessages.connectionError, app.lang.errorMessages.serverUnreachable);
            })
            .done(function (data) {

                if (data.token == false) {
                    app.loader('hide');
                    app.notify('large', 'error', app.lang.errorMessages.connectionError, app.lang.errorMessages.loginIncorrect);
                }
                else {
                    self.set({authToken: data.token});
                    self.setMenu(data.menu);

                    // Set the user Informations //
                    self.setUID(data.user.id)
                    self.setLogin(loginUser);
                    self.setLastConnection(moment().format("LLL"));
                    self.setContext({tz: data.user.context_tz, lang: data.user.context_lang});
                    self.setFirstname(data.user.firstname);
                    self.setLastname(data.user.name);
                    self.setGroups(data.user.groups_id);
                    self.setServices(data.user.service_ids);
                    self.setService(data.user.service_id);
                    self.setContact(data.user.contact_id);
                    self.setManager(data.user.isManager);
                    self.setDST(data.user.isDST);

                    // Add the user to the collection and save it to the localStorage //
                    app.collections.users.add(self);

                    // Get the users informations //
                    self.getTeamsAndOfficers();

                }

                deferred.resolve();
            })

        return deferred;
    },


    /** Logout fonction
     */
    logout: function (options) {
        "use strict";
        var self = this;

        var deferred = $.Deferred();

        app.json(app.config.openerp.url + app.urlOE_sessionDestroy, {
            'session_id': self.getSessionID()
        })
            .fail(function () {
                app.notify('', 'error', app.lang.errorMessages.connectionError, app.lang.errorMessages.serverUnreachable);
            })
            .done(function (data) {
                // On détruit la session dans le localStorage //
                self.destroySessionID();
                self.save();
                // Reset des filtres initialisées dans les listes //
                sessionStorage.clear();

                app.notify('large', 'info', app.lang.infoMessages.information, app.lang.infoMessages.successLogout);

                // Refresh the header //
                app.views.headerView.render();

                // Navigate to the login Page //
                Backbone.history.navigate(app.routes.login.url, {trigger: true, replace: true});
                deferred.resolve();
            });

        return deferred;
    },


    /** Get the menu of the user
     */
    getMenus: function (options) {
        "use strict";
        var self = this;

        return app.json(app.config.openerp.url + app.urlOE_menuUser, {
            'session_id': self.getSessionID()
        }, options)
    },


    /** Get the informations of the user
     */
    getUserInformations: function (options) {
        "use strict";
        var self = this;

        var fields = ['firstname', 'name', 'groups', 'contact_id', 'service_id', 'service_ids', 'isDST', 'isManager'];

        return  app.getOE(this.model_name, fields, [self.getUID()], self.getSessionID(),
            $.ajax({
                url: app.config.barakafrites.url + '/api/open_object/users/' + self.getUID(),
                data: fields,
                headers: {Authorization: 'Token token=' + self.get('authToken')},
                success: function (data) {

                    self.setFirstname(data.user.firstname);
                    self.setLastname(data.user.name);
                    self.setGroups(data.user.groups_id);
                    self.setServices(data.user.service_ids);
                    self.setService(data.user.service_id);
                    self.setContact(data.user.contact_id);
                    self.setManager(data.user.isManager);
                    self.setDST(data.user.isDST);

                    // Refresh the header //
                    app.views.headerView.render(app.router.mainMenus.manageInterventions);

                    // Navigate to the Home page //
                    Backbone.history.navigate(app.routes.home.url, {trigger: true, replace: true});

                },
                error: function (error) {
                    console.error(error);
                    app.notify('', 'error', app.lang.errorMessages.connectionError, app.lang.errorMessages.serverUnreachable);
                }
            })

        );
    }

});