/******************************************
* Request Model
*/
app.Models.Team = Backbone.RelationalModel.extend({

	// Model name in the database //
	model_name : 'openstc.team',	
	
	url: "/#teams/:id",	
	
	relations: [{
					type: Backbone.HasMany,
					key: 'tasks',
					relatedModel: 'app.Models.Task',
					collectionType: 'app.Collections.Tasks',
					includeInJSON: 'id',
					reverseRelation: {
						type: Backbone.HasOne,
						key: 'teamWorkingOn',
						includeInJSON: ['id','manager_id'],
					}
				},
				{
					type: Backbone.HasMany,
					key: 'user_ids',
					relatedModel: 'app.Models.Officer',
					collectionType: 'app.Collections.Officers',
					includeInJSON: 'id',
					reverseRelation: {
						type: Backbone.HasOne,
						key: 'belongsToTeam',
						includeInJSON: ['id','manager_id','tasks'],
					}
				}
	
	],

	/** Model Initialization
	*/
	initialize: function (model) {
	   	console.log("Request task Initialization");
	},


    /** Model Parser
    */
    parse: function(response) {
        return response;
    },

});