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
    module.config(function($locationProvider) {
    	$locationProvider.html5Mode(true);
    });

    /**
     * SERVICES
     */

   	// Authentication Service
   	module.factory('AuthenticationService', function() {
   		var userData = null,
   			userType = 'FB';

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
   			testLogin : function() {
   				userData = { id: 1, name: "User Pruebas", email: "pruebas@meetmeat.andreybolanos.com" };
   				userType = 'Custom';
   				this.route();
   			},
   			isLogin : function() {
   				return (userData != null);
   			},
   			getUser : function() {
   				userData.type = userType;
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
    module.factory('ApiService', function($q, $http, endpoint, AuthenticationService) {
    	var ApiService = {
    		request: function(url, params) {
    			var method = (params && params.method) ? params.method : "GET",
    				data = (params && params.data) ? params.data : null,
    				webservice = endpoint + url;
    			// always return json
    			if (method == "GET") {
    				webservice = webservice + '.json';
    			}
    			// process data
    			if (data) {
    				data =  decodeURIComponent(jQuery.param(data)).replace(/&/g,"\r\n");
    			}
    			// make call
				console.log('Calling WebService',method,data,webservice);
				var promise = $http({method: method, url: webservice, data: data})
								.then(function(response){
									console.log('Success Call',method,data,webservice,response);
				    				return response.data;
				    			});
    			return promise;
    		},
    		post: function(url, obj) {
    			// append user id to create
    			var user = AuthenticationService.getUser();
    			obj.users_id = user.id;
    			// make call
    			return this.request(url, { method: 'POST', data: obj });
    		},
    		create: function(tableName, obj) {
    			var def = $q.defer(),
    				url = tableName;
    			this.post(url, obj).then(function(id){
    				def.resolve(id);
    			});
    			return def.promise;
    		},
    		get: function(url) {
    			return this.request(url, { method: 'GET' });
    		},
    		getTable: function(name) {
    			return this.get(name);
    		},
    		getRow: function(tableName, id) {
    			var res = {};
    			if (id) {
    				res = this.get(tableName + '/' + id);
    			}
    			return res;
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
    		createEvent : function(event) {
    			var self = this,
    				def = $q.defer();
    			// process dates
    			event.startTime = event.date + " " + event.startTime + ":00";
    			event.endTime = event.date + " " + event.endTime + ":00";
    			// Call api
    			ApiService.create(table, event).then(function(id) {
    				self.addEvent(event);
    				def.resolve(id);
    			});
    			return def.promise;
    		},
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

    // Modal service
    module.factory('ModalService', function($rootScope) {
    	var defaults = { message: '', icon: 'ion-sad' };

    	var ModalService = {
    		set: function(msg, icon) {
    			$rootScope.modal.message = (msg) ? msg : defaults.message;
	    		$rootScope.modal.icon = (icon) ? icon  : defaults.icon;
    		},
    		get: function() {
    			return window.modal;
    		},
    		show: function() {
    			this.get().show();
	    	},
	    	hide: function() {
	    		this.get().hide();
	    	},
	    	critical: function(msg, icon) {
				this.set(msg, icon);
	    		this.show();
	    	},
	    	error: function(msg) {
	    		this.notify(msg,'ion-sad');
	    	},
	    	success: function(msg) {
	    		this.notify(msg, 'ion-happy');
	    	},
	    	notify: function(msg, icon) {
	    		var self = this;
	    		self.set(msg, icon);
	    		self.show();
	    		setTimeout(function(){
	    			self.hide();
	    		},3000);
	    	}
    	};

    	return ModalService;
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
    	$http.defaults.headers.post = { "Content-Type" : "text/plain" };

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
    	$scope.testLogin = function() {
    		AuthenticationService.testLogin();
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
    module.controller('EventCreateController', function($scope, EventsService, ModalService) {
    	var navigator = eventsNavigator || null; // jshint ignore:line

    	$scope.event = null;

    	$scope.createEvent = function() {
    		var form = $scope.createEventForm,
    			event = $scope.event;
    		if (form.$valid) {
    			EventsService.createEvent(event).then(function(id){
    				ModalService.success('Evento Creado #'+id);
    				navigator.popPage();
    			});
    		} else {
    			ModalService.error('Revisa el formulario');
    		}
    	};
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
    module.controller('ProfileController', function($scope, AuthenticationService) {
    	var navigator = profileNavigator || null; // jshint ignore:line

    	$scope.profile = AuthenticationService.getUser();
    });

	// Initialize
	module.run(function() {
		// Global settings

	});

})(angular, ons);