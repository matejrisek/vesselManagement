// Common module
var commonModule = angular.module('commonModule', [ 'ui.bootstrap' ]);

// Vessel modal create controller
commonModule.controller('commonDialogQuestionController', function($scope,
		$modalInstance, data) {
	console.log(data);
	$scope.title = data.title;
	$scope.message = data.message;

	$scope.ok = function() {
		$modalInstance.close(true);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});

commonModule.factory('commonDialogs', function($modal) {

	createConfirmationDialog = function(title, message) {
		var modalInstance = $modal.open({
			templateUrl : 'assets/dialogs/confirmationDialog.html',
			controller : 'commonDialogQuestionController',
			size : 'sm',
			resolve : {
				data : function() {
					return {
						title : title,
						message : message
					}
				}
			}
		});

		return modalInstance.result;
	}

	var commonDialogs = {
		createConfirmationDialog : createConfirmationDialog
	};

	return commonDialogs;
});