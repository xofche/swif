app.Views.ClaimerContactView = Backbone.View.extend({

	tagName     : 'tr',
	className   : 'row-nested-objects',
	templateHTML: 'items/claimerContact',

	events: {
		'click a.modalEditContact'  : 'showEditModal',
		'click a.modalDeleteContact': 'showDeleteModal',
	},

	id: function () {
		return 'address_' + this.model.id
	},

	initialize: function () {
		this.user = this.options.user;
		this.listenTo(this.model, 'updateSuccess', this.changed())
	},

	render: function () {
		var self = this;
		this.serialize();
		$.get("templates/" + self.templateHTML + ".html", function (templateData) {
			var template = _.template(templateData, {
				lang   : app.lang,
				address: self.model.toJSON()
			});

			$(self.el).html(template);
		});

		return this;
	},

	serialize: function () {
		if (!_.isUndefined(this.user)) {
			this.model.set('user_login', this.officers.get(this.model.get('user_id')[0]).get('login'));
		}
	},


	changed: function () {
		this.render();
		this.highlight();
		app.notify('', 'success', app.lang.infoMessages.information, this.model.get('name') + ' : ' + app.lang.infoMessages.placeUpdateOk);
	},

	showEditModal: function (e) {
		e.preventDefault();
		new app.Views.ModalContactEdit({model: this.model, el: "#modalEditContact"}).render()
	},

	showDeleteModal: function (e) {
		e.preventDefault();
		new app.Views.ModalDeleteView({id: '#modalDeleteClaimerContact', model: this.model,
			modalTitle: app.lang.viewsTitles.deleteClaimerContact, confirm: app.lang.warningMessages.confirmDelete
		})
	},

	/** Delete Address
	 */
	deleteAddress: function (e) {
		var self = this;
		this.selectedAddress.delete({
			success: function (data) {
				if (data.error) {
					app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				}
				else {
					app.collections.claimersContacts.remove(self.selectedAddress);
					var claimer = app.collections.claimers.get(self.selectedAddressJSON.livesIn.id);
					claimer.attributes.address.remove(self.selectedAddressJSON.id);
					app.collections.claimers.add(claimer);
					$('#modalDeleteContact').modal('hide');
					app.notify('', 'info', app.lang.infoMessages.information, app.lang.infoMessages.addressDeleteOk);
					self.render();
				}
			},
			error  : function (e) {
				alert("Impossible de supprimer le contact");
			}

		});

	},

	highlight: function () {
		app.Helpers.Main.highlight(this.$el);
	},


	/** Set informations to the Modal for delete contact
	 */
	modalDeleteContact: function (e) {
		this.getTarget(e);
		this.selectedAddress = app.collections.claimersContacts.get(this.pos);
		this.selectedAddressJSON = this.selectedAddress.toJSON();
		$('#infoModalDeleteContact').children('p').html(this.selectedAddressJSON.name);
		$('#infoModalDeleteContact').children('small').html(_.capitalize(this.selectedAddressJSON.function));
	},


});