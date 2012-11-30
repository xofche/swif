/******************************************
* Claimer Service Model
*/
app.Models.ClaimerService = Backbone.RelationalModel.extend({
    
	// Model name in the database //
	model_name : 'openstc.service',	
	
	url: "/#demandeurs-services/:id",

/*	relations: [
	{
		// Create a cozy, recursive, one-to-one relationship
		type: Backbone.HasMany,
		key: '',
		relatedModel: 'app.Models.Claimer',
		includeInJSON: true,
		reverseRelation: {
			key: 'service_id'
		}
	}],*/
	
    
	/** Model Initialization
	*/
    initialize: function(){
        console.log('Claimer Service Model initialization');
    },

    /** Model Parser
    */
    parse: function(response) {
        return response;
    },

});
