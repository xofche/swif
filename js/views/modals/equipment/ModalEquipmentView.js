/******************************************
* Place Modal View
*/
app.Views.ModalEquipmentView = app.Views.GenericModalView.extend({


	templateHTML : 'modals/modalEquipment',



	// The DOM events //
	events: function(){
		return _.defaults({
			'submit #formSaveEquipment'   : 'saveEquipment',
			'change #equipmentInternalUse': 'fillEquipmentInternalUse',
			'change #equipmentCategory'   : 'fillEquipmentCategory'
		}, 
			app.Views.GenericModalView.prototype.events
		);
	},



	/** View Initialization
	*/
	initialize : function() {
		var self = this;

		this.modal = $(this.el);


		// Check if it's a create or an update //
		if(_.isUndefined(this.model)){

			this.model = new app.Models.Equipment();
			this.render();
		}
		else{
			// Render with loader //
			this.model.fetch({silent: true, data : {fields : this.model.fields}}).done(function(){
				self.render();
			});
		}

	},



	/** Display the view
	*/
	render : function(loader) {
		var self = this;

		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){

			var template = _.template(templateData, {
				lang     : app.lang,
				equipment: self.model,
				loader   : loader
			});

			self.modal.html(template);

			console.log(self.model);

			if(!loader){
				self.selectEquipmentCategory = new app.Views.AdvancedSelectBoxView({el:'#equipmentCategory', collection: app.Collections.EquipmentsTypes.prototype});
				self.selectEquipmentCategory.setSearchParam('|',true);
				self.selectEquipmentCategory.setSearchParam({field:'is_vehicle',operator:'=',value:true});
				self.selectEquipmentCategory.setSearchParam({field:'is_equipment',operator:'=',value:true});
				self.selectEquipmentCategory.render();

				self.selectEquipmentServicesInternalUse = new app.Views.AdvancedSelectBoxView({el:'#equipmentServicesInternalUse', collection: app.Collections.ClaimersServices.prototype});
				self.selectEquipmentServicesInternalUse.resetSearchParams();
				self.selectEquipmentServicesInternalUse.render();
				//initialize value of internal_use and views updates linked with
				if(!_.isNull(self.model)){
					self.changeEquipmentInternalUse(self.model.getInternalUse());
				}
				
				self.selectEquipmentMaintenanceServices = new app.Views.AdvancedSelectBoxView({el:'#equipmentMaintenanceServices', collection: app.Collections.ClaimersServices.prototype});
				self.selectEquipmentMaintenanceServices.render();

				// Enable the datePicker //
				$('input.datepicker').datepicker({ format: 'dd/mm/yyyy', weekStart: 1, autoclose: true, language: 'fr'});
			}

			self.modal.modal('show');

		});

		return this;
	},
	


	/**
	 * if equipment category refers to an equipment or a vehicle, adapt labels of km, energy_type and immat
	 */
	changeEquipmentCategory: function(categ_id){
		var equipmentCateg = new app.Models.EquipmentType();
		equipmentCateg.set('id', categ_id);
		equipmentCateg.fetch({silent:true}).done(function(){
			if(equipmentCateg.toJSON().is_equipment){
				$('#equipmentKmBlock').css({display:'none'});
				$('#equipmentEnergyLabel').html(app.lang.energy + ':');
				$('#equipmentImmatLabel').html(app.lang.serialNumber + ':');
			}
			else{
				$('#equipmentKmBlock').css({display:'block'});
				$('#equipmentEnergyLabel').html(app.lang.oil + ':');
				$('#equipmentImmatLabel').html(app.lang.immat + ':');

			}
		})
		.fail(function(e){
			console.log(e);
		});
	},
	
	fillEquipmentCategory: function(e){
		this.changeEquipmentCategory(this.selectEquipmentCategory.getSelectedItem());
	},
	
	changeEquipmentInternalUse: function(value){
		if(value){
			$('#labelForEquipmentServicesInternalUse').css('text-decoration','none');
			$('#equipmentServicesInternalUse').removeAttr('disabled');
		}
		else{
			$('#labelForEquipmentServicesInternalUse').css('text-decoration','line-through');
			this.selectEquipmentServicesInternalUse.reset();
			$('#equipmentServicesInternalUse').attr({disabled: 'disabled'});
		}
		this.selectEquipmentServicesInternalUse.render();
	},
	
	fillEquipmentInternalUse: function(e){
		this.changeEquipmentInternalUse($(e.target).is(':checked'));
	},
	



	/** Save the model pass in the view
	*/
	saveEquipment: function(e){
		e.preventDefault();
		var self = this;
		function formatDate(frDate){
			if(frDate != false && frDate != ''){
				return moment(frDate.replace('/','-'),'DD-MM-YYYY').format('YYYY-MM-DD');
			}
			else{
				return false;
			}
		}
		
		params = {
				name: $('#equipmentName').val(),
				default_code: $('#equipmentCode').val(),
				categ_id: this.selectEquipmentCategory.getSelectedItem(),
				internal_use: $('#equipmentInternalUse').is(':checked'),
				service_ids: [[6,0,this.selectEquipmentServicesInternalUse.getSelectedItems()]],
				maintenance_service_ids: [[6,0,this.selectEquipmentMaintenanceServices.getSelectedItems()]],
				immat: $('#equipmentImmat').val(),
				marque: $('#equipmentMarque').val(),
				km: parseInt($('#equipmentKm').val().replace(' ','')),
				energy_type: $('#equipmentEnergy').val(),
//				year: $('#equipmentYear').val(),
				built_date: formatDate($('#equipmentBuiltDate').val()),
				time: $('#equipmentTime').val(),
				length_amort: $('#equipmentLengthAmort').val(),
				purchase_date: formatDate($('#equipmentPurchaseDate').val()),
				purchase_price: $('#equipmentPurchasePrice').val(),
				hour_price: $('#equipmentHourPrice').val(),
				warranty_date: formatDate($('#equipmentWarranty').val())
		}


		this.model.save(params, {patch:!this.model.isNew(), silent:true,wait:true})
			.done(function(data) {
				self.modal.modal('hide');

				// Create mode //
				if(self.model.isNew()) {
					self.model.setId(data);
					self.model.fetch({silent: true, data : {fields : app.Collections.Equipments.prototype.fields} }).done(function(){
						app.views.equipmentsListView.collection.add(self.model);
					})
				// Update mode //
				} else {
					self.model.fetch({ data : {fields : self.model.fields} });
				}
			})
			.fail(function (e) {
				app.Helpers.Main.printError(e);
			})
			.always(function () {
				$(self.el).find("button[type=submit]").button('reset');
			});
		
	}
	
});