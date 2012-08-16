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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {


        // Page elements
        var $titleContainer = $('#entity_name');
        var $semesterContainer = $('#entity_semester');
        var $lastUpdatedContainer = $('#classpages_updated_on');

        // Get class ID from URL
        var classid = $.deparam.fragment().cid;
        var divcounter = 0;

        // Detect changes to the hashed URL params and load new json
        $(window).bind("hashchange", function(e, data){
            var classid = $.deparam.fragment().cid;
            getData(classid);
        });

        // Store original document title so we can overwriter it later without
        // infinitely appending to it as user clicks through class pages.
        var doctitle = document.title;


        var divsloaded = function() {
            /*
                We can't do equal height divs until data for affected widget divs has loaded, so we
                send a trigger from each widget div that needs its height measured after its
                content has been loaded. Then we just count those incoming triggers until the
                counter reaches "n" and fire.
            */
            if (divcounter >= 1) {
                // Set top two divs to equal heights.
                var highestCol = Math.max($('#cc-classpage-description').height(),$('#cc-classpage-ccclassinfo').height());
                $('.equalcols').height(highestCol);
            } else {
                divcounter++;
            }
        };


        // Bind this window to the divsloaded function so we can trigger it from the widgets.
        $(window).on('divsloaded', function() {
            divsloaded();
        });


        var renderPage = function( data ) {
            // Semester string in title combines two fields in the JSON
            // In all cases, handle missing data as well
            // var semesterString = data.schedule.current_sem + " " + data.courseinfo.year;

            var semesterString = (data.schedule) ? data.schedule.current_sem + " " + data.courseinfo.year : null;
            $semesterContainer.text(semesterString);

            var pageTitle = (data.courseinfo.title) ? data.courseinfo.title : 'Class title unavailable';
            $titleContainer.text(pageTitle);

            var updatedString = (data.info_last_updated) ? "Class info last updated on " + data.info_last_updated : null;
            $lastUpdatedContainer.text(updatedString);

            document.title = doctitle + " " + data.classtitle;
        };


        var getData = function(classid,callback){
            // var url = "/devwidgets/ccclassinfo/courseinfo.json";
            var url = "/system/myberkeley/classpages";
            $.ajax({
                url: url,
                cache: false,
                type: 'GET',
                data: { classid: classid },
                success: function(data){
                    if (data) {
                        // Store vars we need for rendering the classpage container
                        renderPage(data);
                    }
                    if ($.isFunction(callback)) {
                        callback();
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    console.log("Error loading data");
                    renderPage({'data':false});
                }
            });
        };

        getData(classid);

        define(function(){
            return {
                classid: classid
            };
        });



});

