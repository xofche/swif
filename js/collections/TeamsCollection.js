/******************************************
* Teams Collection
*/
app.Collections.Teams = app.Collections.GenericCollection.extend({

	model        : app.Models.Team,

	fields       : ['id', 'name', 'actions', 'manager_id', 'service_names', 'user_names'],

	default_sort : { by: 'name', order: 'ASC' },

	url          : '/api/openstc/teams',



	/** Collection Initialization
	*/
	initialize: function (options) {
		//console.log('Teams collection Initialization');
	},


});
