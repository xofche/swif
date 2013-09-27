/******************************************
* Claimer Type Model
*/
app.Models.ClaimerType = app.Models.GenericModel.extend({


	fields  : ['id', 'name', 'code', 'actions'],

	urlRoot : '/api/open_object/partner_types',


	searchable_fields: [
		{
			key  : 'name', 
			type : 'text'
		},
		{
			key  : 'code', 
			type : 'text'
		}
	],

	
	getCode : function() {
		return this.get('code');
	},
	setCode : function(value, silent) {
		this.set({ code : value }, {silent: silent});
	},


	/** Get Informations of the model
	*/
	getInformations : function(){
		var informations = {};

		informations.name = this.getName();

		if(!_.isEmpty(this.getCode())){
			informations.infos = {};
			informations.infos.key = _.capitalize(app.lang.code);
			informations.infos.value = this.getCode();
		}

		return informations;
	}

});