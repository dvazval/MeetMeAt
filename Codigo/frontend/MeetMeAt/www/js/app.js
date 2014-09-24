//  __  __           _   __  __              _
// |  \/  |         | | |  \/  |        /\  | |
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

// dependencies
var angular = angular || {},
	ons = ons || {},
	openFB = openFB || null,
	console = console || {};

// navigator (overwrite on page load)
var rootNavigator = null;

(function(angular, ons){

    'use strict';

	// Initialize Angular
    var module = angular.module('meetmeat', ['onsen']);
    module.constant('appName', 'MeetMeAt');
    module.constant('endpoint', 'http://meetmeat.andreybolanos.com/rest/');

    /**
     * SERVICES
     */

   	// Authentication Service
   	module.factory('AuthenticationService', function() {
   		var userData = null,
   			userType = 'fb';

   		var AuthenticationService = {
   			facebookLogin : function() {
   				var self = this;
   				openFB.init({appId:'839453376075539'});
   				openFB.login(function(response) {
	                if(response.status === 'connected') {
	                    openFB.api({
	                        path: '/me',
	                        success: function(data) {
	                            userData = data;
	                            userType = 'fb';
	                            self.route();
	                        }
	                    });
	                }
	            });
   				// var $dfd = $.fblogin({ fbId: '839453376075539' });
   				// $dfd.done(function (data) {
				// 	userData = data;
				// 	userType = 'fb';
				// 	self.route();
				// });
   			},
   			isLogin : function() {
   				return (userData != null);
   			},
   			getUser : function() {
   				return userData;
   			},
   			route : function() {
   				if (!this.isLogin()) {
		    		rootNavigator.resetToPage('views/login.html');
		    	} else {
		    		rootNavigator.resetToPage('views/main.html', { animation: 'slide-left' });
		    	}
   			}
   		};

   		return AuthenticationService;
   	});

    // Api Service
    module.factory('ApiService', function($q, $http, endpoint) {
    	var ApiService = {
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
    	return ApiService;
    });

	// Events service
    module.factory('EventsService', function($q, ApiService) {
    	var events = [],
    		currentEvent = null,
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
    			return ApiService.getAll(table, function(event) {
    				self.addEvent(event);
    			});
    		},
    		setCurrent: function(event) {
    			currentEvent = event;
    		},
    		getCurrent: function() {
    			return currentEvent;
    		}
    	};

    	return EventsService;
    });

    // Friends service
    module.factory('FriendsService', function(ApiService){
    	var friends = [],
    		currentFriend = null,
    		table = 'users';

    	var FriendsService = {
    		addFriend: function(friend) {
    			friends.push(friend);
    		},
    		getFriends: function() {
    			return friends;
    		},
    		load: function() {
    			var self = this;
    			friends = [];
    			return ApiService.getAll(table, function(event) {
    				self.addFriend(event);
    			});
    		},
    		setCurrent: function(friend) {
    			currentFriend = friend;
    		},
    		getCurrent: function() {
    			return currentFriend;
    		}
    	};

    	return FriendsService;
    });

    /**
     * CONTROLLERS
     */

    // App Controller
    module.controller('AppController', function($http, AuthenticationService) {
    	// Setup
    	// var authToken;
		// $http.get('/auth.py').success(function(data, status, headers) {
		// 	authToken = headers('A-Token');
		// 	$scope.user = data;
		// });
    	// $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
    	$http.defaults.cache = true;

    	// Show initial view
    	ons.ready(function(){
    		AuthenticationService.route();
    	});
    });

    // Login
    module.controller('LoginController', function($scope, AuthenticationService) {
    	$scope.facebookLogin = function() {
    		AuthenticationService.facebookLogin();
    	};
    });

    // Home
    module.controller('HomeController', function() {
    	//
    });

    // Events list
	module.controller('EventsController', function($scope, EventsService) {
		var navigator = eventsNavigator || null; // jshint ignore:line

		$scope.loading = 'loading-in-progress';

		EventsService.load().then(function(){
			$scope.events = EventsService.getEvents();
			$scope.loading = 'loading-completed';
		});

		$scope.view = function(index) {
			var event = $scope.events[index];
			EventsService.setCurrent(event);
			navigator.pushPage('views/events/view.html', event);
		};

		$scope.create = function() {
			navigator.pushPage('views/events/create.html');
		};
	});

	// Event view
	module.controller('EventViewController', function($scope, EventsService) {
		$scope.event = EventsService.getCurrent();
	});

	// Event create
    module.controller('EventCreateController', function() {
    	//
    });

	// Friends
    module.controller('FriendsController', function($scope, FriendsService) {
    	var navigator = friendsNavigator || null; // jshint ignore:line

    	$scope.loading = 'loading-in-progress';

		FriendsService.load().then(function(){
			$scope.friends = FriendsService.getFriends();
			$scope.loading = 'loading-completed';
		});

		$scope.viewFriend = function(index) {
			var friend = $scope.friends[index];
			FriendsService.setCurrent(friend);
			navigator.pushPage('views/friends/view.html', friend);
		};
    });

    // Friend view
	module.controller('FriendViewController', function($scope, FriendsService) {
		$scope.friend = FriendsService.getCurrent();
	});

    // Profile
    module.controller('ProfileController', function() {
    	//
    });

	// Initialize
	module.run(function() {
		// Global settings
	});

})(angular, ons);