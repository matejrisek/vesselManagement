// Vessel module
var vesselModule = angular.module('vesselModule', [ 'ui.bootstrap',
		'commonModule' ]);

/*******************************************************************************
 * CONTROLLERS
 ******************************************************************************/

// Vessel controller
vesselModule.controller('vesselController', function($scope, $modal,
		vesselService, commonDialogs) {

	$scope.displayed = [];
	$scope.vessels = [];
	$scope.vessel = null;
	$scope.itemsByPage = 10;
	$scope.searchInput = '';

	$scope.listVessels = function(tableState) {
		var name = '';
		if (tableState.search.predicateObject) {
			name = tableState.search.predicateObject.name;
		}

		var start = (tableState.pagination.start / $scope.itemsByPage) + 1
		vesselService.listVessels(start, $scope.itemsByPage, name).then(
				function(data) {
					tableState.pagination.numberOfPages = data.count;
					$scope.vessels = data.vessels;
					this.isLoading = false;
					$scope.displayed = [].concat($scope.vessels);
				});
	}

	$scope.addVessel = function(vessel) {
		vesselService.addVessel(vessel).then(function() {
			console.log('Vessel created!');
			$scope.listVessels(getEmptyListObject());
		}, function(errorMessage) {
			console.warn(errorMessage);
		});
	}

	$scope.updateVessel = function(vessel) {
		vesselService.updateVessel(vessel).then(function() {
			console.log('Vessel updated!');
			$scope.listVessels(getEmptyListObject());
		}, function(errorMessage) {
			console.warn(errorMessage);
		});
	}

	$scope.removeVessel = function(vessel) {
		commonDialogs.createConfirmationDialog('Delete vessel',
				'Are you really sure?').then(function() {
			$scope.searchInput = '';
			vesselService.removeVessel(vessel).then(function() {
				console.log('Vessel removed!');
				$scope.listVessels(getEmptyListObject());
			}, function(errorMessage) {
				console.warn(errorMessage);
			});

		}, function() {
			console.log('Modal dismissed at: ' + new Date());
		});
	}

	// Functions for modal window
	$scope.createModal = function(vessel) {
		var modalInstance = $modal.open({
			templateUrl : 'assets/dialogs/vesselDialog.html',
			controller : 'vesselModalCreate',
			size : 'lg',
			resolve : {
				vessel : function() {
					if (!vessel) {
						return null;
					} else {
						return angular.copy(vessel)
					}
				}
			}
		});

		modalInstance.result.then(function(vessel) {
			$scope.searchInput = '';
			if (!vessel._id) {
				$scope.addVessel(vessel);
			} else {
				$scope.updateVessel(vessel);
			}
		}, function() {
			console.log('Modal dismissed at: ' + new Date());
		});
	}

});

/*
 * MODAL FORM CONTROLLER
 */
// Vessel modal create controller
vesselModule.controller('vesselModalCreate', function($scope, $modalInstance,
		vessel) {
	$scope.vessel = vessel;

	$scope.ok = function() {
		$modalInstance.close($scope.vessel);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

/*******************************************************************************
 * SERVICES
 ******************************************************************************/
// Vessel service
vesselModule.service('vesselService', function($http, $q) {

	return ({
		addVessel : addVessel,
		removeVessel : removeVessel,
		updateVessel : updateVessel,
		listVessels : listVessels
	});

	/*
	 * Function for creation of a new vessel
	 */
	function addVessel(vessel) {
		var request = $http({
			method : 'post',
			url : 'vessels/create/',
			data : {
				name : vessel.name,
				width : vessel.width,
				length : vessel.length,
				draft : vessel.draft,
				long : vessel.long,
				lat : vessel.lat
			}
		});

		return request.then(handleSuccess, handleError);
	}

	/*
	 * Function for removal of a vessel
	 */
	function removeVessel(vessel) {
		var request = $http({
			method : 'post',
			url : 'vessels/remove/',
			data : {
				_id : vessel._id,
				name : vessel.name,
				width : vessel.width,
				length : vessel.length,
				draft : vessel.draft,
				long : vessel.long,
				lat : vessel.lat
			}
		});

		return request.then(handleSuccess, handleError);
	}

	/*
	 * Function for updating a vessel
	 */
	function updateVessel(vessel) {
		var request = $http({
			method : 'post',
			url : 'vessels/update/',
			data : {
				_id : vessel._id,
				name : vessel.name,
				width : vessel.width,
				length : vessel.length,
				draft : vessel.draft,
				long : vessel.long,
				lat : vessel.lat
			}
		});

		return request.then(handleSuccess, handleError);
	}

	/*
	 * Function that returns list of vessels by params given
	 */
	function listVessels(start, numberOfItems, name) {
		var request = $http({
			method : 'post',
			url : 'vessels/list/',
			data : {
				name : name ? name : '',
				page : start,
				numberOfItems : numberOfItems
			}
		});
		return request.then(handleSuccess, handleError);
	}

	function handleError(response) {
		if (!response.data) {
			return $q.reject("An unknown error occurred.")
		}

		return $q.reject(response.data);
	}

	function handleSuccess(response) {
		return response.data;
	}
});

/*******************************************************************************
 * FUNCTIONS
 ******************************************************************************/
function getEmptyListObject() {
	return {
		pagination : {
			start : 0,
			numberOfPages : 1
		},
		search : {
			predicateObject : {
				name : ''
			}

		}
	}
}