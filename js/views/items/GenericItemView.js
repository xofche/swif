/*!
 * SWIF-OpenSTC
 * Copyright 2013-2014 Siclic <contact@siclic.fr>
 * Licensed under AGPL-3.0 (https://www.gnu.org/licenses/agpl.txt)
 */

define([
	'app',
	'appHelpers',

	
	'moment'


], function(app, AppHelpers, moment){

	'use strict';

	return Backbone.View.extend({

		tagName      : 'tr',

		className    : 'row-item',

		templateHTML : '',
		templateSmallActionHTML : '/templates/others/templateSmallActionComponent.html',
		templateButtonActionHTML : '/templates/others/templateButtonActionComponent.html',
		
		classModel	: null,
		
		events: {
			
		},
		
		/**
		 * Method used by template to display actions on the view.
		 * if action not present in model.actions, display nothing, else, display the component
		 */
		renderSmallActions: function(dom){
			if(dom.length > 0){
				var actions = dom.attr('data-actions').split(',');
				var ret = '';
				var self = this;
				return $.when($.get(app.menus.openstcpatrimoine+this.templateSmallActionHTML)).done(function(smallActionTemplate){
					_.each(actions, function(action){
						
						if(_.contains(self.authorizedActions, action)){
							if(_.has(self.classModel.actions,action)){
								var modelAction = self.classModel.actions[action];
								ret += _.template(smallActionTemplate,{action:modelAction});
							}
							else{
								console.warn('Error, action "' + action + '" not present in model definition, please implement it in actions model attribute');
							}
						}
					});
					dom.html(ret);
				});
			}
		},
		
		/**
		 * Method used by template to display button actions (right side) on the view.
		 * if action not present in model.actions, display nothing, else, display the component
		 */
		renderButtonAction: function(dom){
			var ret = '';
			var self = this;
			function getActionDefinition(action){
				var value = null;
				if(_.contains(self.authorizedActions, action)){
					if(_.has(self.classModel.actions, action)){
						value = self.classModel.actions[action];
					}
					else{
						console.warning('Error, action "' + action + '" not present in model definition, please implement it in actions model attribute');
					}
				}
				return value;
			}
			
			if(dom.length > 0){
				var actions = dom.attr('data-actions').split(',');
				var mainAction = dom.attr('data-main-action');
				
				return $.when($.get(app.menus.openstcpatrimoine+this.templateButtonActionHTML)).done(function(buttonActionTemplate){
					if(mainAction){
						//if mainAction present in actions authorized to user, render the component, else, do nothing
						var modelMainAction = getActionDefinition(mainAction);
						if(modelMainAction){
							actions = _.without(actions, mainAction);
							//retrieve other actions authorized to user and render them in the component
							var modelOtherActions = [];
							_.each(actions, function(action){
								var elt = getActionDefinition(action);
								if(elt){
									modelOtherActions.push(elt);
								}
							});
							ret = _.template(buttonActionTemplate, {
								mainAction:modelMainAction,
								otherActions: modelOtherActions
							});
						}
					}
					dom.html(ret);
				});
			}
		},
		
		toFrDate: function(date){
			var value = moment.utc(date);
			return value.format('DD/MM/YYYY');
		},
		
		toFrDatetime: function(datetime){
			var value = AppHelpers.convertDateToTz(datetime);
			return value.format('DD/MM/YYYY hh[h]mm');
		},
		
		integerToStr: function(integer){
			return integer.toString();
		},
		
		toStringMany2one: function(value){
			var ret = '';
			if(value !== '' && value.length > 0){
				ret = _.capitalize(value[1]);
			}
			return ret;
		},
		
		/**
		 * render data using data-fieldname and self.fieldsModel to know how to display value
		 */
		renderFieldsValues: function(){
			var self = this;
			$(this.el).find('.field').each(function(){
				var field = $(this).data('fieldname');
				if(_.has(self.model.collection.fieldsMetadata,field)){
					var elt = self.model.collection.fieldsMetadata[field];
					if(_.has(self.fieldParser,elt.type)){
						var value = self.fieldParser[elt.type](self.model.getAttribute(field,''));
						$(this).html(value);
					}
					else{
						console.warn('Swif Error: Unrecognized field type "' + elt.type.toString() + '", authorized values are : "' + _.keys(self.fieldParser));
					}
				}
				else{
					console.warn('Swif Error: "' + field + '" not present on Collection, authorized values are : "' + _.keys(self.model.collection.fieldsMetadata));
				}
			});
		},
		
		
		/** View Initialization
		*/
		initialize: function (params) {
			this.fieldParser = {
				date		: this.toFrDate,
				datetime	: this.toFrDatetime,
				char		: _.capitalize,
				text		: _.capitalize,
				integer		: this.integerToStr,
				selection	: _.capitalize,
				many2one	: this.toStringMany2one
			};
			
			this.options = params;
		},

		/** Display the view
		*/
		render : function() {
			var self = this;
			// Retrieve the template //
				
			if(_.isUndefined(self.actions)){self.authorizedActions = self.model.getAttribute('actions',[]);}

			self.renderFieldsValues();
			$.when(self.renderButtonAction($(self.el).find('.button-actions')),
					self.renderSmallActions($(self.el).find('.small-actions'))).always(function(){
				// Set the Tooltip //
				$('*[data-toggle="tooltip"]').tooltip({container: 'body'});
				$('*[data-toggle="popover"]').popover({trigger: 'hover', container: 'body'});
			});

			return this;
		},
		
	});
});