// 2015 C. Zinn, University of Tuebingen

// create our angular app and inject ngAnimate and ui-router 
// =============================================================================
angular.module('formApp', ['ngAnimate', 'ui.router', 'ui.bootstrap', 'checklist-model' ])


// configuring our routes 
// =============================================================================
.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider
    
        // route to show our basic form (/form)
        .state('form', {
            url: '/form',
            templateUrl: 'form-en.html',
            controller: 'formController'
        })
        
        // nested states 
        // each of these sections will have their own view
        // url will be nested (/form/project)
	.state('form.project', {
            url: '/project',
            templateUrl: 'form-project-en.html'
        })

        // url will be /form/dataDesc
        .state('form.dataDesc', {
            url: '/dataDesc',
            templateUrl: 'form-dataDesc-en.html'
        })

        // documentation and metadata
        .state('form.metadata', {
            url: '/metadata',
            templateUrl: 'form-metadata-en.html'
        })
    
        // ethics and legal compliance
        .state('form.ethicsLicence', {
            url: '/ethicsLicence',
            templateUrl: 'form-ethicsLicence-en.html'
        })

        // storage and backup
        .state('form.storageBackup', {
            url: '/storageBackup',
            templateUrl: 'form-storageBackup-en.html'
        })
    
        // storage and backup
	.state('form.archiveMgr', {
            url: '/archiveMgr',
            templateUrl: 'form-archiveMgr-en.html'
        })
    
        // url will be /form/timetable
        .state('form.timetable', {
            url: '/timetable',
            templateUrl: 'form-timetable-en.html'
        })

        // e.g., how will potential users find your data, with whom will your share the data, under which conditions
        .state('form.dataSharing', {
            url: '/dataSharing',
            templateUrl: 'form-dataSharing-en.html'
        })

        // url will be /form/budget
        .state('form.budget', {
            url: '/budget',
            templateUrl: 'form-budget-en.html'
        });
       
    // catch all route
    // send users to the form page 
    $urlRouterProvider.otherwise('/form/project');
})


// our controller for the form
// =============================================================================
.controller('formController',function($q, $scope, $http) {
    
    // we will store all of our form data in this object
    $scope.formData = {};
    $scope.predefinedDataFormats = ['TEI-P5', 'DTA', 'IDS_XCES', 'docs', 'pdf', 'LaTeX', 'wav', 'aiff', 'mp3', 'PCM audio', 'avi', 'Quicktime (mov)', 'Matroska (mkv)', 'MPEG2', 'MPEG4/H.264', ];
    
    $scope.userSelectedDataFormats = [];
    
    
    // fetch centre model for the Clarin centres
    //    console.log('fetching CLARIN center data');

    $scope.clarind_centres = [];
    $http.get('https://centres.clarin.eu/api/model/Centre').
	success(function(centresData, status, headers, config) {
	    $scope.centres = centresData;
	    //	    console.log('all centres', $scope.centres);
	    for (var c in $scope.centres) {
//		console.debug('centres', $scope.centres[c].pk);
		if ($scope.centres[c].fields.consortium == 1) {
		    console.debug("Found a Clarin-D institution:", $scope.centres[c].fields.name, $scope.centres[c].pk, $scope.centres[c]);
		    var centreCompact = { name:   $scope.centres[c].fields.name,
					  ac:     $scope.centres[c].fields.administrative_contact,
					  tc:     $scope.centres[c].fields.technical_contact,
					  dsa:    $scope.centres[c].fields.dsa_url
					};
		    
		    console.debug('adding centreCompact', centreCompact.name, centreCompact.ac, centreCompact.tc, centreCompact.dsa);
		    
		    $scope.clarind_centres.push( centreCompact );
		    
		} else {
		    //console.debug("Found a Non-Clarin-D institution:", $scope.centres[c].fields.name);		    
		}
    	    }

	    // add ANOTHER OPTION
	    $scope.clarind_centres.push( { name: "Other center (noted in document)",
					   ac: 999,
					   tc: 999
					 });
	    
	    console.debug('all clarind_centres', $scope.clarind_centres);
	}).
	error(function(centresData, status, headers, config) {
	    console.debug('Error fetching center data from CLARIN', status);
	});

    // fetch centre registry contect model from Clarin
//    console.log('fetching CLARIN contact data');
    $http.get('https://centres.clarin.eu/api/model/Contact').
	success(function(contactData, status, headers, config) {
	    $scope.contacts = contactData;

	    console.log('all contacts', $scope.contacts);
	}).
	error(function(centresData, status, headers, config) {
	    console.debug('Error fetching contact data from CLARIN', status);
	});    

    // fetch the consortium information (to get country codes)
    $http.get('https://centres.clarin.eu/api/model/Consortium').
	success(function(consortiumData, status, headers, config) {
	    $scope.consortium = consortiumData;
	    console.log('all consortia', $scope.consortium);
	    // for (var c in $scope.consortium) {
	    // 	console.debug('consortium', $scope.consortium[c].fields.country_name);
	    // 	if ($scope.consortium[c].fields.country_name == "Germany") {
	    // 	    console.debug("Found Germany:", $scope.consortium[c].pk);
	    // 	    break;
	    // 	}
	    // }
	}).
	error(function(centresData, status, headers, config) {
	    console.debug('Error fetching consortium data from CLARIN', status);
	});    

    $scope.$watch('formData.archivar', function(newVal) {
	console.debug('$watcher for archivar has been called', newVal, $scope.formData.archivar);

	$scope.clarinContacts = [];
	var found = false;
	// Now, check the list of contacts and find the one with the correct 'pk'
	if (newVal) {
	    for (var c in $scope.contacts) {
		console.debug('watcher is checking ', $scope.contacts[c].pk);
		if ($scope.contacts[c].pk == newVal) {
		    console.debug('watcher has found ', $scope.contacts[c].pk, $scope.contacts[c].fields.name);
		    $scope.clarinContacts.push( $scope.contacts[c].fields.name );
		    $scope.formData.clarinContact = $scope.clarinContacts[0];
		    found = true;
		    break;
		}
	    }
	    if (!found) {
		$scope.clarinContacts.push( "Name the contact person in the document!" );
		$scope.formData.clarinContact = $scope.clarinContacts[0];
	    } else {
		// need to replace newVal with Institution
		for (var c in $scope.clarind_centres) {
		    if ($scope.clarind_centres[c].ac == newVal) {
			console.debug('decoding', newVal, 'to', $scope.clarind_centres[c].name);
			$scope.formData.archivarRealName = $scope.clarind_centres[c].name;
			$scope.formData.archivarDSA = $scope.clarind_centres[c].dsa;
		    }
		}
	    }
	}
    });
    
    // ------------ date picker stuff start  ---------------

    $scope.format = 'dd-MMMM-yyyy';
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };
    
  // Disable weekend selection
  // $scope.disabled = function(date, mode) {
  //   return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  // };

  $scope.formData.metadataProductionDate = new Date();
    
  $scope.metadataProductionDate_today = function() {
      $scope.formData.metadataProductionDate = new Date();
  };

  $scope.metadataProductionDate_clear = function () {
      $scope.formData.metadataProductionDate = null;
  };

  $scope.metadataProductionDate_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.metadataProductionDate_opened = true;
      // setTimeout(function() {
      // 	  $scope.metadataProductionDate_opened = false;
      // }, 10);  
  };
    
  // automatically calling it when page is opened
  // $scope.metadataProductionDate_today();

  $scope.dataIngest_today = function() {
      $scope.formData.dataIngest = new Date();
  };

  $scope.dataIngest_clear = function () {
      $scope.formData.dataIngest = null;
  };

  $scope.dataIngest_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      $scope.dataIngest_opened = true;
  };

  // serviceFrom
  $scope.serviceFrom_today = function() {
      $scope.formData.serviceFrom = new Date();
  };

  $scope.serviceFrom_clear = function () {
      $scope.formData.serviceFrom = null;
  };

  $scope.serviceFrom_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      $scope.serviceFrom_opened = true;
  };

  // dataPubWiss
  $scope.dataPubWiss_today = function() {
      $scope.formData.dataPubWiss = new Date();
  };

  $scope.dataPubWiss_clear = function () {
      $scope.formData.dataPubWiss = null;
  };

  $scope.dataPubWiss_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      $scope.dataPubWiss_opened = true;
  };

  // dataPub
  $scope.dataPub_today = function() {
      $scope.formData.dataPub = new Date();
  };

  $scope.dataPub_clear = function () {
      $scope.formData.dataPub = null;
  };

  $scope.dataPub_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      $scope.dataPub_opened = true;
  };
    
  // serviceMin
  $scope.serviceMin_today = function() {
      $scope.formData.serviceMin = new Date();
  };

  $scope.serviceMin_clear = function () {
      $scope.formData.serviceMin = null;
  };

  $scope.serviceMin_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      $scope.serviceMin_opened = true;
  };
    
  // dataDelete
  $scope.dataDelete_today = function() {
      $scope.formData.dataDelete = new Date();
  };

  $scope.dataDelete_clear = function () {
      $scope.formData.dataDelete = null;
  };

  $scope.dataDelete_open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      $scope.dataDelete_opened = true;
  };
    
    // ------------ date picker stuff end ---------------

    
    // old school access to DOM node
    var data = document.getElementById("researchDataPlan.html").innerHTML;
    console.debug('plan init', data);
    
    $scope.processForm = function() {

	var data = document.getElementById("researchDataPlan.html").innerHTML;
	console.debug('plan dynamic', data);
	
	switch ($scope.formData.formatFormDocument) {
	    
	case "Microsoft Word (docx)":
	    delete $http.defaults.headers.common['X-Requested-With'];
	    $http.post('../../../cgi-bin/gen_docx.cgi', data, {responseType: 'arraybuffer'}
		      ).success(function(dataResponse){
			  var blob = new Blob([dataResponse], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
			  var url = (window.URL || window.webkitURL).createObjectURL(blob);
			  var element = angular.element('<a/>');
			  element.attr({
			      href: url,
			      target: '_blank',
			      download: 'dataMgtPlan.docx'
			  })[0].click();
			  
		      }).error(function(){
			  alert("error");
		      });	    
	    alert('The plan was downloaded as a Microsoft Word document (docx)!');
	    break;
	    
	case "Rich Text Format (rtf)":
	    delete $http.defaults.headers.common['X-Requested-With'];
	    $http.post('../../../cgi-bin/gen_rtf.cgi', data, {responseType: 'arraybuffer'}
		      ).success(function(dataResponse){
			  var blob = new Blob([dataResponse], {type: 'application/rtf'});
			  var url = (window.URL || window.webkitURL).createObjectURL(blob);
			  var element = angular.element('<a/>');
			  element.attr({
			      href: url,
			      target: '_blank',
			      download: 'dataMgtPlan.rtf'
			  })[0].click();
			  
		      }).error(function(){
			  alert("error");
		      });	    
	    alert('The plan was downloaded as an RTF!');	    
	    break;
	case "LaTeX":
	    delete $http.defaults.headers.common['X-Requested-With'];
	    $http.post('../../../cgi-bin/gen_latex.cgi', data, {responseType: 'arraybuffer'}
		      ).success(function(dataResponse){
			  var blob = new Blob([dataResponse], {type: 'application/x-latex'});
			  var url = (window.URL || window.webkitURL).createObjectURL(blob);
			  var element = angular.element('<a/>');
			  element.attr({
			      href: url,
			      target: '_blank',
			      download: 'dataMgtPlan.tex'
			  })[0].click();
			  
		      }).error(function(){
			  alert("error");
		      });	    
	    alert('The plan was downloaded as a LaTeX file!');	    
	    break;	    

	default:
	    alert('Please choose a document format!');
	}
    }
})

.directive('datepickerPopup', function (){
    return {
	restrict: 'EAC',
	require: 'ngModel',
	link: function(scope, element, attr, controller) {
	    // remove the default formatter from the input directive to prevent conflict
	    // console.log('directive has been called', controller);
	    controller.$formatters.shift();
	}
    }
});


