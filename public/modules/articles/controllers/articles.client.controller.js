'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function(isValid) {
			if (isValid) {
				var article = new Articles({
					title: this.title,
					content: this.content
				});
				article.$save(function(response) {
					$location.path('articles/' + response._id);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			
				this.title = '';
				this.content = '';
			} else {
				$scope.submitted = true;
			}
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function(isValid) {
	            	if (isValid) {
	                	var article = $scope.article;
	
	                	article.$update(function() {
	                    		$location.path('articles/' + article._id);
	                	}, function(errorResponse) {
	                    		$scope.error = errorResponse.data.message;
	                	});
		            } else {
		                	$scope.submitted = true;
		            }
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
