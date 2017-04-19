/**
 * Created by Wilfred on 4/11/17.
 */
'use strict';
function handleSubmit(e) {

    console.log('hello!');
}

//getting elements from DOM
var inputOneDOM = $('#InputOne');
var inputTwoDOM = $('#InputTwo');

var resultOne = $('#viewOne');
var resultTwo = $('#viewTwo');






angular.module('myApp', []).controller('namesCtrl', function ($scope) {


    //when stop is clicked
    $scope.FirstFilter = function(stop){
        inputTwoDOM.val(stop);

    };

    //when stop is clicked
    $scope.SecondFilter = function(stop){
        inputOneDOM.val(stop);

    };

    inputOneDOM.focus(function () {
        //has focus
        resultTwo.css('display', 'block');
    });
    inputOneDOM.blur(function(){
        //lost focus
        setTimeout(function () {
            resultTwo.css('display', 'none');
        },150);
    });

//handling inputTwo  --------------//
    inputTwoDOM.focus(function () {
        //has focus
        resultOne.css('display', 'block');
    });

    inputTwoDOM.blur(function(){
        //lost focus
        setTimeout(function () {
            resultOne.css('display', 'none');
        },150);

    });







    //array that has all the names
    $scope.names =
        ['Rush Rhees Library', ' Brooks Crossing', ' Brooks & Evangeline',
            'Brooks Landing - Genesee Street @ Plymouth Avenue', ' Brooks & Kron',
            'Brooks Avenue & Millbank Street/Paige Street', ' 30 Corporate Woods',
            '120 Corporate Woods', ' 155 Corporate Woods', ' Corporate Woods Overflow Lot',
            'College Town/ Celebration Drive', ' College Town - Mt. Hope', ' College Town - East/Goler',
            '240 Crittenden Blvd. - Helen Wood Hall', ' 266 Crittenden Blvd. - MHW Lot at Bus Stop',
            'Crittenden Road- Rustic Village', ' Crittenden Blvd. - Whipple Circle',
            'Crittenden Blvd at Whipple Circle', ' Crittenden & West Henrietta', ' 250 East River Road - Laser Lab',
            'East & Alexander', ' East Drive & Goler Bus Shelter', ' Scottsville Shelter B',
            'Intercampus Drive (Goergen Hall) - Wilmot (Southbound)', ' South & Alexander', ' Monroe & Alexander',
            'East Drive & Goler Bus Stop', ' 320 Kendrick Road- Lot 1', ' 295 Kendrick Road - Lot 11',
            '260 Kendrick Road - Lot 9', ' Murlin Drive - Whipple Park', ' 415 Elmwood Avenue - School of Medicine',
            'Scottsville Shelter A', ' 150 Norfolk Street - Lattimore Office Building', ' 284 Kendrick Road - Lot 2/3',
            '200 Kendrick Road - Southside/University Park', ' 100 Gibbs Street - Eastman Living Center',
            'Genesee & Congress', ' Genesee Street & Genesee Park Blvd.', ' Genesee & Spruce',
            'Genesee Park Blvd & Pioneer', ' Genesee & Terrace Pk', ' Genesee & Weldon',
            'Golisano Children s Hospital Lower Loop', ' Gregory Street @ South Avenue - Gregory & South',
            'Mt. Hope Avenue @ McLean Street - Mt. Hope & McLean', ' Jefferson Plaza',
            'Marketplace Mall - Miracle Mile Drive', ' Target - 2325 Marketplace Drive',
            'Wal-Mart - Henrietta - 1200 Marketplace Drive', ' Regal - Henrietta - 525 Marketplace Drive',
            'Highland Hospital Main Loop', ' Towers - Tower Road @ Intercampus Drive', ' Monroe & Goodman',
            'Park & Culver', ' East & Barrington', ' Park Lot - 512 Intercampus Drive',
            'Riverview Apartments - 1250 Plymouth Avenue', ' 2750 Monroe Avenue', ' Park Lot North',
            'Pioneer & Weldon', ' Pioneer & Spruce', ' Pioneer & Congress', ' Pioneer & Terrace Pk',
            'Pioneer & Brooks', ' Public Market - 280 Union Street North', ' Mt. Hope & Elmwood',
            'Tops Plaza - 1900 Clinton Avenue S', ' Twelve Corners- 1900 Monroe Avenue',
            'Pittsford Plaza - 3349 Monroe Avenue', ' Intercampus Drive at Library Road',
            '2609 West Henrietta Road|Movies 10', ' Wegmans - 650 Hylan Drive', ' Wilson & Hutchinson',
            'Wilson & McLean'];


});

//handling inputOne --------------//
