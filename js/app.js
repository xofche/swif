/******************************************
* APPLICATION NAMESPACE
*/

var app = {

	
	// Global variables app //
	uniq_id_counter : 0,
	
	urlOE_authentication        : '/web/session/authenticate',
	urlOE_versionServer         : '/web/webclient/version_info',
	urlOE_sessionDestroy        : '/web/session/destroy',
	urlOE_sessionInformation    : '/web/session/get_session_info',
	urlOE_menuUser              : '/web/menu/load',
	urlOE_retrieveListe         : '/web/dataset/search_read',
	urlOE_readObject            : '/web/dataset/get',
	urlOE_createObject          : '/web/dataset/create',
	urlOE_updateObject          : '/web/dataset/save',
	urlOE_deleteObject          : '/web/dataset/call',
	urlOE_object          		: '/web/dataset/call',



	// Classes //
	Collections     : {},
	Models          : {},
	Views           : {},

	// Instances //
	properties      : {},
	routes          : {},
	configuration   : {},
	lang            : {},
	collections     : {},
	models          : {},
	views           : {},
	templates       : {},




	/** Application initialization
	*/
	init: function (lang) {


		// Retrieve App properties, configuration and language //
		$.when(app.loadProperties('properties.json'), app.loadConfiguration('config/configuration.json'), app.loadRoutes('config/routes.json'), app.loadI18nScripts(lang))
			.done(function(properties_data, configuration_data, routes_data, lang_data){
			
				// Set the app properties configuration and language //
				app.routes        = routes_data[0];
				app.properties    = properties_data[0];
				app.configuration = configuration_data[0];
				app.lang          = lang_data[0];


				// Instantiation Collections users  et user //
				app.collections.users           = new app.Collections.Users();
				app.collections.users.fetch();
				app.models.user                 = new app.Models.User();
				//app.models.team               = new app.Models.Team();
				app.models.task                 = new app.Models.Task();
				app.models.intervention         = new app.Models.Intervention();
				app.models.request              = new app.Models.Request();
				app.models.place                = new app.Models.Place();
				app.models.service              = new app.Models.ClaimerService();
				app.models.categoryTask         = new app.Models.CategoryTask();
				app.models.categoryIntervention = new app.Models.CategoryIntervention();
				app.models.claimerContact       = new app.Models.ClaimerContact();
				app.models.claimerType          = new app.Models.ClaimerType();

				// Router initialization //
				app.router = new app.Router();
				// Listen url changes //
				Backbone.history.start({pushState: false});
			})
			.fail(function(){
				console.error('Unable to init the app');
			});

	},
	

	/** Load internationalization scripts
	*/
	loadI18nScripts: function (lang) {
		
		return $.getJSON('i18n/'+lang+'/app-lang.json')
			.success(function(data) {
			
				var script = document.createElement('script');
				script.type = 'text/javascript'; script.src = 'i18n/'+lang+'/moment-lang.js';
				$('#app').append(script);

				var script = document.createElement('script');
				script.type = 'text/javascript'; script.src = 'i18n/'+lang+'/bootstrap-datepicker-lang.js';
				$('#app').append(script);

				// I18N Moment JS //
				moment.lang(lang);

			})
			.fail(function(){
				alert('Impossible de charger les fichiers de langues');
			});
	},



	/** Load application configuration
	*/
	loadConfiguration: function(url){

		return $.getJSON(url)
			.success(function(data){
			})
			.fail(function(){
				alert('Impossible de charger le fichier de configuration');
			});
	},



	/** Load application properties
	*/
	loadProperties: function(url){

		return $.getJSON(url)
			.success(function(data){
			})
			.fail(function(){
				alert('Impossible de charger le fichier de propriétés');
			});
	},
	


	/** Load application properties
	*/
	loadRoutes: function(url){

		return $.getJSON(url)
			.success(function(data){
			})
			.fail(function(){
				alert('Impossible de charger le fichier de routes');
			});
	},




	/******************************************
	* GENERIC FUNCTION FOR JSON/AJAX
	*/

	/** Formats an AJAX response to wrap JSON.
	*/
	rpc_jsonp: function(url, payload, options) {

		"use strict";

		// Extracted from payload to set on the url //
		var data = {
			session_id: '',
			id: payload.id
		};

		var ajax = _.extend({
			type: "GET",
			dataType: 'jsonp',
			jsonp: 'jsonp',
			//async: false,
			cache: false,
			data: data,
			url: url
		}, options);


		var payload_str = JSON.stringify(payload);
		console.debug(payload);

		var payload_url = $.param({r: payload_str});

		if (payload_url.length > 2000) {
			throw new Error("Payload is too big.");
		}
		// Direct jsonp request
		ajax.data.r = payload_str;
		return $.ajax(ajax);

	},


	/** Formats a standard JSON 2.0 call
	*/
	json: function (url, params, options) {

		"use strict";

		var deferred = $.Deferred();

		app.uniq_id_counter += 1;
		var payload = {
			'jsonrpc' : '2.0',
			'method'  : 'call',
			'params'  : params,
			'id'      : ("r" + app.uniq_id_counter)
		};

		app.rpc_jsonp(url, payload, options).then(function (data, textStatus, jqXHR) {
			if (data.error) {
				deferred.reject(data.error);
			}
			deferred.resolve(data.result, textStatus, jqXHR);
		});

		return deferred;
	},
	

	/** Retrieve an object from OpenERP
	*/
	getOE : function (model, fields, ids, session_id, options) {
		this.json(app.configuration.openerp.url + this.urlOE_readObject, {
			'model'     : model,
			'fields'    : fields, 
			'ids'       : ids,
			'session_id': session_id
		}, options)

	},


	/** Retrieve a list from OpenERP
	*/
	readOE : function (model, session_id, options, fields) {

		if(_.isUndefined(fields))
				fields = [];

		this.json(app.configuration.openerp.url + this.urlOE_retrieveListe, {
			'model'     : model,
			'fields'    : fields,
			'session_id': session_id
		}, options)
	},


	/** Delete object from OpenERP
	*/
	deleteOE : function (args,model,session_id,options) {
		this.json(app.configuration.openerp.url + this.urlOE_deleteObject, {
			'method'    : "unlink",
			'args'      : args, 
			'model'     : model,
			'session_id': session_id      
	   }, options);  
	},
		

	/** Save object in OpenERP
	*/
	saveOE : function (id, data, model, session_id, options) {
		if(id)
			this.json(app.configuration.openerp.url + this.urlOE_updateObject, {
				'data'      : data, 
				'model'     : model, 
				'id'        : id,
				'session_id': session_id      
		   },options);
		else
			this.json(app.configuration.openerp.url + this.urlOE_createObject, {
					'data'      : data, 
					'model'     : model,                 
					'session_id': session_id      
		   }, options);      
	},
	
	/** call object method from OpenERP
	*/
	callObjectMethodOE : function (args,model,method,session_id,options) {
		this.json(app.configuration.openerp.url + this.urlOE_object, {
			'method'    : method,
			'args'      : args, 
			'model'     : model,
			'session_id': session_id      
	   }, options);  
	},

/*
	loadTemplate : function(id, callback){


		var template = app.templates[id];

		if (template) {
		  callback(template);
		}
		else {
 

		// Retrieve Application language //
		$.ajax({
			type: 'GET', url: 'templates/' + id + '.html',
			success: function(data, textStatus, jqXHR) {
				var $tmpl = $(template);
				app.templates[id] = $tmpl;
				callback($tmpl);
			},
			error: function(jqXHR, textStatus, errorThrown){
				alert('Unable to retrieve template');
			}
		});

	   }
	},

*/

	/** Page Loader
	*/
	loader: function(action){

		switch(action){
			case 'display':
				$('#loader, #modal-block').fadeIn();
			break;

			case 'hide':
				$('#loader, #modal-block').delay(250).fadeOut('slow');
			break;
		}
	},



	/** Transform Decimal number to hour:minute
	*/
	decimalNumberToTime: function(decimalNumber){

		// Check if the number is decimal //
		if(_.str.include(decimalNumber, '.')){
			var minutes = _.lpad(((_.rpad(_(decimalNumber).strRight('.'), 2, '0') / 100) * 60), 2, '0');
			var hour = _(decimalNumber).strLeft('.');

			if(hour == 0){
				var date = _(minutes).toNumber()+app.lang.minuteShort;
			}
			else{
				var date = hour+'h'+_(minutes).toNumber();    
			}
		}
		else{
			var date = decimalNumber+'h';
		}
		
		return date;
	},



	/** Notification Message
	*/
	notify: function(notifyModel, type, title, message) {

		"use strict";

		switch(notifyModel){
			case 'large' :
				var addClass = 'stack-bar-top big-icon';
				var width = '50%';
				var delay = 4500;
				var hide = true;
			break;

			default:
				var addClass = '';
				var width = '320px';
				var delay = 4500;
				var hide = true;
			break;

		}
		
		$.pnotify({
			title: title,
			text: message,
			addclass: addClass,
			width: width,
			type: type,
			hide: hide,
			animate_speed: 'normal',
			opacity: .9,
			icon: true,
			animation: 'slide',
			closer: true,
			closer_hover: false,
			delay: delay
		});
	}


};



// No conflict between Underscore && Underscore String //
_.mixin(_.str.exports());



/******************************************
* AFTER THE LOADING OF THE PAGE
*/
$(document).ready(function () {	
	app.init('fr');
});


