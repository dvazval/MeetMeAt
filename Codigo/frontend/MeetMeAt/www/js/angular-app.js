//  __  __           _   __  __              _
// |  \/  |         | | |  \/  |        /\  | |
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

var angular = angular || {},
	ons = ons || {},
	console = console || {};

(function(angular){

    'use strict';

	// Initialize Angular
    var module = angular.module('meetmeat', ['onsen']);
    module.constant('appName', 'MeetMeAt');
    module.constant('endpoint', 'http://meetmeat.andreybolanos.com/rest/');

    // App Controller
    module.controller('AppController', function($http) {
    	// Setup
    	// var authToken;
		// $http.get('/auth.py').success(function(data, status, headers) {
		// 	authToken = headers('A-Token');
		// 	$scope.user = data;
		// });
    	// $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
    	$http.defaults.cache = true;
    });

    // Services
    module.factory('RestService', function($q, $http, endpoint) {
    	var RestService = {
    		request: function(url, params) {
    			var method = (params && params.method) ? params.method : "GET",
    				webservice = endpoint + url;
    			console.log('Calling WebService [' + method + ':' + webservice + ']');
    			var promise = $http({method:method, url: webservice}).then(function(response){
    				return response.data;
    			});
    			return promise;
    		},
    		get: function(url) {
    			return this.request(url, { method: 'GET' });
    		},
    		getTable: function(name) {
    			return this.get(name);
    		},
    		getRow: function(tableName, id) {
    			return this.get(tableName + '/' + id);
    		},
    		getAll: function(tableName, saveRowCallback) {
    			var def = $q.defer(),
    				self = this;
    			this.getTable(tableName).then(function(data){
    				var rows = [];
    				angular.forEach(data, function(obj) {
    					var id = obj.value;
    					var idef = self.getRow(tableName, id).then(function(dataRow){
    						// transform api model to local model
    						var row = {};
    						dataRow.map(function(obj){
    							row[obj.field] = obj.value;
    						});
    						dataRow = row;
    						// return row
    						saveRowCallback(dataRow);
    					});
    					rows.push(idef);
    				});
    				$q.all(rows).then(function(){
						def.resolve();
					});
    			});
    			return def.promise;
    		}
    	};
    	return RestService;
    });

    module.factory('EventsService', function($q, RestService) {
    	var events = [],
    		table = 'events';
    	var EventsService = {
    		addEvent: function(event) {
    			events.push(event);
    		},
    		getEvents: function() {
    			return events;
    		},
    		load: function() {
    			var self = this;
    			events = [];
    			return RestService.getAll(table, function(event) {
    				self.addEvent(event);
    			});
    		}
    	};

    	return EventsService;
    });

    // Events list
	module.controller('EventsListController', function($scope,EventsService) {
		EventsService.load().then(function(){
			$scope.events = EventsService.getEvents();
		});
	});

	// Initialize
	module.run(function() {
		// Global settings
	});

})(angular);