/*!
 * SWIF-OpenSTC
 * Copyright 2013-2014 Siclic <contact@siclic.fr>
 * Licensed under AGPL-3.0 (https://www.gnu.org/licenses/agpl.txt)
 */

define([
	'app'

], function(app){

	'use strict';

	/******************************************
	* Login View
	*/
	var LoginView = Backbone.View.extend({


		el           : '#rowContainer',

		templateHTML : 'templates/others/login.html',


		// The DOM events //
		events: {
			'submit #formConnection'          : 'login',
			'change #loginUser'               : 'hideLastConnection',

			'mousedown #toggelDisplayPassword': 'displayPassword',
			'mouseup #toggelDisplayPassword'  : 'hidePassword',

			'click a.toggleFlip'    : 'toggleForgotPassword'
		},



		/** View Initialization
		*/
		initialize: function() {
			//console.log('Login view Initialize');
		},



		/** Display the view
		*/
		render: function() {
			var self = this;

			// Change the page title //
			app.router.setPageTitle(app.lang.applicationName +' '+ app.lang.viewsTitles.login);
			app.router.toggleCityWallpaper();


			// Retrieve the Login template //
			$.get(this.templateHTML, function(templateData){


				var template = _.template(templateData, {
					lang    : app.lang,
					user    : self.model,
					cityLogo: app.config.medias.cityLogo
				});

				$(self.el).html(template);

				// Set the Tooltip //
				$('*[data-toggle="tooltip"]').tooltip({ container: 'body' });


				// Set the focus to the login or password input //
				if(!_.isNull(self.model.getUID())){
					$('#passUser').focus();
				}
				else{
					$('#loginUser').focus();
				}

			});


			$(this.el).hide().fadeIn();
			return this;
		},



		/** Login Function
		*/
		login: function(e){
			e.preventDefault();
			var self = this;


			// Set the button in loading State //
			$('#formConnection').find('fieldset').prop('disabled', true);
			$(this.el).find('button[type=submit]').button('loading');

			// Execution user login function //
			var checkLogin = this.model.login($('#loginUser').val(), $('#passUser').val());


			checkLogin.done(function(data){
				// Set user data and Save it //
				app.current_user.setUserData(data);
				// TODO : Move this to an authentication library, abstract Storage which resolves to localStorage or fallback to sessionStorage
				localStorage.setItem('current_user', JSON.stringify(app.current_user));
				// The above replace this previous model.save() :
				// app.current_user.save();

				app.setAjaxSetup();

				app.views.headerView.render();
				Backbone.history.navigate(app.routes.home.url, {trigger: true, replace: true});

				app.router.toggleCityWallpaper();
			});
			checkLogin.fail(function(e){

				if(e.status == 401){
					$('#passUser').parents('.form-group').addClass('has-error');
					$('#errorLogin').removeClass('hide');
				}


				$('#formConnection').find('fieldset').prop('disabled', false);
				$('#passUser').focus();

				// Reset password value //
				$(self.el).find('button[type=submit]').button('reset');
				$('#passUser').val('');
			});
		},



		/** Hide the last connection information if the user change
		*/
		hideLastConnection: function(){
			$('#lastConnection').fadeOut();
		},



		/** Display the password
		*/
		displayPassword: function(e){
			$('#passUser').prop('type', 'text');
			$(e.target).removeClass('fa-eye').addClass('fa-eye-slash');
		},

		/** Hide the password
		*/
		hidePassword: function(e){
			$('#passUser').prop('type', 'password');
			$('#passUser').focus();
			$(e.target).removeClass('fa-eye-slash').addClass('fa-eye');
		},


		/** Toggle forgot Password
		*/
		toggleForgotPassword: function(e){
			e.preventDefault();

			$('.flip-container').toggleClass('flip');
		}

	});


	return LoginView;

});