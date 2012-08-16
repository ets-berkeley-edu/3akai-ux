/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */


// load the master sakai object to access all Sakai OAE API methods
// require(["jquery", "sakai/sakai.api.core"], function($, sakai) {
require(["jquery", "sakai/sakai.api.core", "/dev/lib/myb/myb.classpages.js"], function($, sakai, classpages) {


    /**
     * @name sakai.ccclasssections
     *
     * @class ccclasssections
     *
     * @description
     * Display set of sections for a given course offering.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.ccclasssections = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mainContainer = $("#cc-classpage-sections-table", $rootel);
        var $sectionsDisplayContainer = $("#cc-classpage-sections-table", $rootel);
        var $expandoText = $('a#classpages_showhideall', $rootel);


        /////////////////////////
        // Main View functions //
        /////////////////////////

        var renderSections = function( data ) {
            var sectionsHTML = sakai.api.Util.TemplateRenderer( $sectionsDisplayContainer, {
                sections: data.sections
            });
            $sectionsDisplayContainer.html( sakai.api.i18n.General.process( sectionsHTML ) );

            // Enable show all / hide all functionality
            hideAllSections();
            showAllSections();

            // Collapse all class section rows and set initial value for expand/collapse text
            $('tr.classpages_metadata').hide();

            // Toggle individual sections open/closed when clicked
            $('div.classpages_sections_arrow').on('click',function() {
                // Each class section consists of two table rows - one shown on page load, the other hidden.
                // Each section arrow lives in a td inside the first row of its set.
                // When clicked, find its parent tr, then find that tr's next sibling and show/hide it.
                $(this).parents('tr.classpages_classrow').eq(0).next().toggle('slow');

                // And turn the disclosure triangle by adding or removing an additional class
                if ($(this).hasClass('classpages_sections_arrow_opened')) {
                    $(this).removeClass('classpages_sections_arrow_opened');
                } else {
                    $(this).addClass('classpages_sections_arrow_opened');
                }
                // On _section click_, check whether we need to link/delink the expand/collapse text
                expandTextToggle();

            });
            // On _page load_, check whether we need to link/delink the expand/collapse text.
            // Also enable binding for midterm and final alert boxes.
            expandTextToggle();
            showNotes();
        };


        var showMainView = function() {
            $mainContainer.show();
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        // Detect changes to the hashed URL params and load new json
        $(window).bind("hashchange", function(e, data){
            var classid = $.deparam.fragment().cid;
            getSections(classid);
        });

        var getSections = function(classid, callback){
            // var url = "/devwidgets/ccclassinfo/courseinfo.json";

            // Need to get the right JSON URL both on initial page load
            // and when the URL hash changes. If classid exists in the widget space, use it.
            // Otherwise, inherit classid from the parent container
            var thisclassid = (classid) ? classid : classpages.classid;
            var url = "/system/myberkeley/classpages";

            $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                data: { classid: thisclassid },
                success: function(data){
                    if (data) {
                        // Render JSON data to HTML
                        renderSections(data);
                    }
                    if ($.isFunction(callback)) {
                        callback();
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    console.log("Error loading data");
                    renderSections({'data':false});

                }
            });
        };

        var showAllSections = function() {
            // Expand all sections regardless their current state
            $('button#classpages_expandall').on('click',function() {
                $('div.classpages_sections_arrow').addClass('classpages_sections_arrow_opened');
                $('tr.classpages_metadata').show();
                expandTextToggle();
            });
        };

        var hideAllSections = function() {
            // Collapse all sections regardless their current state
            $('button#classpages_collapseall').on('click',function() {
                $('div.classpages_sections_arrow').removeClass('classpages_sections_arrow_opened');
                $('tr.classpages_metadata').hide();
                expandTextToggle();
            });
        };

        var expandTextToggle = function() {

            // If ALL sections are expanded, add a class to disable the Expand All link.
            // Otherwise remove that class. Similar for Collapse All.

            var totalSections = $('div.classpages_sections_arrow').length;
            var curOpen = $('div.classpages_sections_arrow_opened').length;

            if (totalSections === curOpen) {
                $('button#classpages_expandall').addClass('classpages_nolink');
            } else {
                $('button#classpages_expandall').removeClass('classpages_nolink');
            }

            // Do same in reverse for the Collapse all link
            if (curOpen !== 0) {
                $('button#classpages_collapseall').removeClass('classpages_nolink');
            } else {
                $('button#classpages_collapseall').addClass('classpages_nolink');
            }
        };

        var showNotes = function() {
            // Throw alerts when "Notes" are present for midterms or finals
            $('a.show_note').on('click',function() {
                alert($(this).attr('data-note'));
            });
        };


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var doInit = function () {
            getSections();
            showMainView();


            // Initially hide all section rows
            $('tr.classpages_metadata').hide();
        };

        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("ccclasssections");
});
