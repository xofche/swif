/******************************************
* Row Claimer Type View
*/
app.Views.ItemClaimerTypeView = Backbone.View.extend({

	tagName      : 'tr',

	className    : 'row-item',

	templateHTML : 'items/itemClaimerType',


	// The DOM events //
	events: {
		'click'                          : 'modalUpdateClaimerType',
		'click a.modalDeleteClaimerType' : 'modalDeleteClaimerType'
	},



	/** View Initialization
	*/
	initialize : function() {
		this.model.off();

		// When the model are updated //
		this.listenTo(this.model, 'change', this.change);

		// When the model are destroy //
		this.listenTo(this.model,'destroy', this.destroy);
	},



	/** When the model is updated //
	*/
	change: function(e){

		this.render();
		app.Helpers.Main.highlight($(this.el));
		app.notify('', 'success', app.lang.infoMessages.information, this.model.getName()+' : '+app.lang.infoMessages.claimerTypeUpdateOk);
	},



	/** When the model is destroy //
	*/
	destroy: function(e){
		var self = this;

		app.Helpers.Main.highlight($(this.el)).done(function(){
			self.remove();
			app.views.claimerTypesListView.partialRender();
		});

		app.notify('', 'success', app.lang.infoMessages.information, e.getName()+' : '+app.lang.infoMessages.claimerTypeDeleteOk);
	},



	/** Display the view
	*/
	render : function() {
		var self = this;

		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){

			var template = _.template(templateData, {
				lang        : app.lang,
				claimerType : self.model
			});

			$(self.el).html(template);

			// Set the Tooltip //
			$('*[data-toggle="tooltip"]').tooltip();

		});

		return this;
	},



	/** Display Modal form to add/sav a new Claimer type
	*/
	modalUpdateClaimerType: function(e){  
		e.preventDefault(); e.stopPropagation();

		app.views.modalClaimerTypeView = new app.Views.ModalClaimerTypeView({
			el      : '#modalSaveClaimerType',
			model   : this.model,
			elFocus : $(e.target).data('form-id')
		});
	},



	/** Modal to remove an Claimer Type
	*/
	modalDeleteClaimerType: function(e){
		e.preventDefault(); e.stopPropagation();

		app.views.modalDeleteView = new app.Views.ModalDeleteView({
			el           : '#modalDeleteClaimerType',
			model        : this.model,
			modalTitle   : app.lang.viewsTitles.deleteClaimerType,
			modalConfirm : app.lang.warningMessages.confirmDeleteClaimerType
		});
	},

});