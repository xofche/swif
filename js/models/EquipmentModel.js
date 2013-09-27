/******************************************
* Equipment Model
*/
app.Models.Equipment = app.Models.GenericModel.extend({
	
	urlRoot: "/api/openstc/equipments",
	
	fields : ['id', 'name', 'maintenance_service_ids', 'internal_use', 'immat', 'marque', 'usage', 'type', 'cv', 'year', 'time', 'km', 'energy_type', 'length_amort', 'purchase_price', 'default_code', 'categ_id', 'service_names', 'maintenance_service_names', 'complete_name', 'warranty_date','built_date','purchase_date', 'hour_price'],


	searchable_fields: [
		{
			key  : 'name',
			type : 'text'
		},
		{
			key  : 'immat', 
			type : 'text'
		}
	],


	getImmat : function() {
		return this.get('immat');
	},
	setImmat : function(value) {
		this.set({ immat : value });
	},  


	getService : function() {
		return this.get('service');
	},
	setService : function(value) {
		this.set({ service : value });
	},  

	//service IDs //
	getServices : function(type){

		var equipmentServices = [];

		_.each(this.get('service_names'), function(s){
			switch (type){
				case 'id': 
					equipmentServices.push(s[0]);
				break;
				case 'json': 
					equipmentServices.push({id: s[0], name: s[1]});
				break;
				default:
					equipmentServices.push(s[1]);
			}
		});

		if(type == 'string'){
			return _.toSentence(equipmentServices, ', ', ' '+app.lang.and+' ')
		}
		else{
			return equipmentServices;
		}
	},
	setServices : function(value, silent) {
		this.set({ service_ids : [[6, 0, value]] }, {silent: silent});
	},


	getMaintenanceServiceNames : function(type){

		var equipmentServices = [];

		_.each(this.get('maintenance_service_names'), function(s){
			switch (type){
				case 'id': 
					equipmentServices.push(s[0]);
				break;
				case 'json': 
					equipmentServices.push({id: s[0], name: s[1]});
				break;
				default:
					equipmentServices.push(s[1]);
			}
		});

		if(type == 'string'){
			return _.toSentence(equipmentServices, ', ', ' '+app.lang.and+' ')
		}
		else{
			return equipmentServices;
		}
	},


	getMarque : function() {
		return this.get('marque');
	},
	setMarque : function(value) {
		this.set({ marque : value });
	},

	getCode : function(value) {
		return this.get('default_code');
	}, 

	getType : function() {
		return this.get('type');
	},
	setType : function(value) {
		this.set({ type : value });
	},

	getEnergy: function(){
		return this.get('energy_type');
	},

	getUsage : function() {
		return this.get('usage');
	},
	setUsage : function(value) {
		this.set({ usage : value });
	}, 

	getCategory : function(type) {
		switch (type){ 
			case 'id': 
				return this.get('categ_id')[0];
			break;
			case 'json':
				return {id: this.get('categ_id')[0], name: this.get('categ_id')[1]};
			break;
			default:
				return this.get('categ_id')[1];
		}
	},

	getCV : function() {
		return this.get('usage');
	},
	setCV : function(value) {
		this.set({ cv : value });
	}, 

	getKm : function() {
		return _.numberFormat(this.get('km'), 0, '.', ' ');
	},
	setKm : function(value) {
		this.set({ km : value });
	}, 

	getYear : function() {
		if(this.get('year') != 0){
			return this.get('year');
		}
		else{
			return '';
		}
	},
	setYear : function(value) {
		this.set({ year : value });
	},


	getTime : function() {
		return _.numberFormat(this.get('time'), 0, '.', ' ');
	},
	setTime : function(value) {
		this.set({ time : value });
	}, 
	
	isTechnicalVehicle : function() {
		return this.get('technical_vehicle');
	},
	setTechnicalVehicle : function(value) {
		this.set({ technical_vehicle : value });
	}, 
	
	isCommercialVehicle : function() {
		return this.get('commercial_vehicle');
	},
	setCommercialVehicle : function(value) {
		this.set({ commercial_vehicle : value });
	}, 
	
	isSmallMaterial : function() {
		return this.get('small_material');
	},
	setSmallMaterial : function(value) {
		this.set({ small_material : value });
	}, 
	
	isFatMaterial : function() {
		return this.get('fat_material');
	},
	setFatMaterial : function(value) {
		this.set({ fat_material : value });
	},

	getPurchasePrice: function(){
		return this.get('purchase_price');
	},

	getDateEndWarranty: function(type){
		var format = type;
		if(_.isUndefined(format)){
			format = 'YYYY-MM-DD';
		}
		ret = this.get('warranty_date');
		if(!ret){
			return '';
		}
		else{
			return moment(ret).format(format);
		}
	},
	
	getBuiltDate: function(type){
		var format = type;
		if(_.isUndefined(format)){
			format = 'YYYY-MM-DD';
		}
		ret = this.get('built_date');
		if(!ret){
			return '';
		}
		else{
			return moment(ret).format(format);
		}
	},
	
	getPurchaseDate: function(type){
		var format = type;
		if(_.isUndefined(format)){
			format = 'YYYY-MM-DD';
		}
		ret = this.get('purchase_date');
		if(!ret){
			return '';
		}
		else{
			return moment(ret).format(format);
		}
	},
	
	getHourPrice: function(){
		return this.get('hour_price');
	},
	
	getInternalUse: function(){
		return this.get('internal_use');
	},
	
	/** Get Informations of the model
	*/
	getLengthAmort: function(){
		return this.get('length_amort');
	},
	
	getInformations : function(){
		var informations = {};

		informations.name = this.getName();

		if(!_.isEmpty(this.getImmat())){
			informations.infos = {};
			informations.infos.key = _.capitalize(app.lang.immat);
			informations.infos.value = this.getImmat();
		}

		return informations;
	},


	/** Model Initialization
	*/
	initialize: function(){
		//console.log('Equipment Model initialization');
	},


});