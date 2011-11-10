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

require(["jquery","sakai/sakai.api.core", "/dev/javascript/myb/myb.securepage.js"], function($, sakai) {

    sakai_global.content_profile = function(){

        var previous_content_path = false;
        var content_path = ""; // The current path of the content
        var ready_event_fired = 0;
        var list_event_fired = false;
        var intervalId;

        var showPreview = true;
        var filename = "";

        ///////////////////////////////
        // PRIVATE UTILITY FUNCTIONS //
        ///////////////////////////////

        /**
         * Load the content profile for the current content path
         * @param {Boolean} ignoreActivity Flag to also update activity data or not
         */
        var loadContentProfile = function(callback, ignoreActivity){
            // Check whether there is actually a content path in the URL
            if (content_path) {
                
                // Get the content information, the members and managers and version information
                var batchRequests = [
                    {
                        "url": content_path + ".infinity.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": content_path + ".members.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": content_path + ".versions.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": sakai.config.URL.POOLED_CONTENT_ACTIVITY_FEED,
                        "method":"GET",
                        "cache":false,
                        "dataType":"json",
                        "parameters":{"p":content_path, "items":"1000"}
                    }
                ];

                var contentInfo = false;
                var contentMembers = false;
                var contentActivity = false;
                var versionInfo = false;

                sakai.api.Server.batch(batchRequests, function(success, data) {
                    if (success) {
                        if (data.results.hasOwnProperty(0)) {
                            if (data.results[0]["status"] === 404){
                                sakai.api.Security.send404();
                                return;
                            } else if (data.results[0]["status"] === 403){
                                sakai.api.Security.send403();
                                return;
                            } else {
                                contentInfo = $.parseJSON(data.results[0].body);
                                if (contentInfo["_mimeType"] && contentInfo["_mimeType"] === "x-sakai/document"){
                                    showPreview = false;
                                } else {
                                    switchToOneColumnLayout(false);
                                }
                            }
                        }

                        if (data.results.hasOwnProperty(1)) {
                            contentMembers = $.parseJSON(data.results[1].body);
                            contentMembers.viewers = contentMembers.viewers || {};
                            $.each(contentMembers.viewers, function(index, resultObject) {
                                if (contentMembers.viewers[index].hasOwnProperty("basic") &&
                                    contentMembers.viewers[index].basic.hasOwnProperty("elements") &&
                                    contentMembers.viewers[index].basic.elements.hasOwnProperty("picture") &&
                                    contentMembers.viewers[index].basic.elements.picture.hasOwnProperty("value")) {
                                        contentMembers.viewers[index].picture = $.parseJSON(contentMembers.viewers[index].basic.elements.picture.value);
                                }
                                if (contentMembers.viewers[index]["sakai:excludeSearch"] === "true"){
                                    contentMembers.viewers[index].pseudoGroup = true;
                                    contentMembers.viewers[index].parent = {};
                                    var groupid = contentMembers.viewers[index].groupid;
                                    contentMembers.viewers[index].parent["sakai:group-id"] = groupid.substring(0, groupid.lastIndexOf("-"));
                                    var grouptitle = contentMembers.viewers[index]["sakai:group-title"];
                                    contentMembers.viewers[index].parent["sakai:group-title"] = $.trim(grouptitle.substring(0, grouptitle.lastIndexOf("(")));
                                    contentMembers.viewers[index].parent["sakai:role-title"] = grouptitle.substring(grouptitle.lastIndexOf("("));
                                }
                            });
                            contentMembers.managers = contentMembers.managers || {};
                            $.each(contentMembers.managers, function(index, resultObject) {
                                if (contentMembers.managers[index].hasOwnProperty("basic") &&
                                    contentMembers.managers[index].basic.hasOwnProperty("elements") &&
                                    contentMembers.managers[index].basic.elements.hasOwnProperty("picture") &&
                                    contentMembers.managers[index].basic.elements.picture.hasOwnProperty("value")) {
                                        contentMembers.managers[index].picture = $.parseJSON(contentMembers.managers[index].basic.elements.picture.value);
                                }
                                if (contentMembers.managers[index]["sakai:excludeSearch"] === "true"){
                                    contentMembers.managers[index].pseudoGroup = true;
                                    contentMembers.managers[index].parent = {};
                                    var groupid = contentMembers.managers[index].groupid;
                                    contentMembers.managers[index].parent["sakai:group-id"] = groupid.substring(0, groupid.lastIndexOf("-"));
                                    var grouptitle = contentMembers.managers[index]["sakai:group-title"];
                                    contentMembers.managers[index].parent["sakai:group-title"] = $.trim(grouptitle.substring(0, grouptitle.lastIndexOf("(")));
                                    contentMembers.managers[index].parent["sakai:role-title"] = grouptitle.substring(grouptitle.lastIndexOf("("));
                                }
                            });
                        }

                        if (data.results.hasOwnProperty(2)) {
                            versionInfo =$.parseJSON(data.results[2].body);
                            var versions = [];
                            for (var i in versionInfo.versions) {
                                if(versionInfo.versions.hasOwnProperty(i)){
                                    var splitDate = versionInfo.versions[i]["_created"];
                                    versionInfo.versions[i]["_created"] = sakai.api.l10n.transformDate(new Date(splitDate));
                                    versions.push(versionInfo.versions[i]);
                                }
                            }
                            versionInfo.versions = versions.reverse();
                        }
                        
                        if (data.results.hasOwnProperty(3)) {
                            contentActivity = $.parseJSON(data.results[3].body);
                        }

                        var manager = sakai.api.Content.isUserAManager(contentInfo, sakai.data.me);
                        var viewer = sakai.api.Content.isUserAViewer(contentInfo, sakai.data.me);

                        var directory = [];
                        // When only one tag is put in this will not be an array but a string
                        // We need an array to parse and display the results
                        if (contentInfo && contentInfo['sakai:tags']) {
                            directory = sakai.api.Util.getDirectoryTags(contentInfo["sakai:tags"].toString());
                        }

                        var fullPath = content_path + "/" + sakai.api.Util.safeURL(contentInfo["sakai:pooled-content-file-name"]);

                        // filter out the the everyone group and the anonymous user
                        contentMembers.viewers = $.grep(contentMembers.viewers, function(resultObject, index){
                            if (resultObject['sakai:group-id'] !== 'everyone' &&
                                resultObject['rep:userId'] !== 'anonymous') {
                                return true;
                            }
                            return false;
                        });

                        contentMembers.counts = { people: 0, groups: 0};
                        $.each(contentMembers.viewers.concat(contentMembers.managers), function(i, member) {
                            if (member.hasOwnProperty("userid")) {
                                contentMembers.counts.people++;
                            } else {
                                contentMembers.counts.groups++;
                            }
                        });

                        var mimeType = sakai.api.Content.getMimeType(contentInfo);
                        contentInfo.mimeType = mimeType;
                        if (sakai.config.MimeTypes[mimeType]) {
                            contentInfo.iconURL = sakai.config.MimeTypes[mimeType].URL;
                        } else {
                            contentInfo.iconURL = sakai.config.MimeTypes["other"].URL;
                        }

                        if (ignoreActivity && sakai_global.content_profile && sakai_global.content_profile.content_data){
                            contentActivity = sakai_global.content_profile.content_data.activity;
                        }

                        json = {
                            data: contentInfo,
                            members: contentMembers,
                            activity: contentActivity,
                            mode: "content",
                            url: sakai.config.SakaiDomain + fullPath,
                            path: fullPath,
                            smallPath: content_path,
                            saveddirectory : directory,
                            versions : versionInfo,
                            content_path: content_path,
                            isManager: manager,
                            isViewer: viewer
                        };

                        sakai_global.content_profile.content_data = json;
                        $(window).trigger("ready.contentprofile.sakai");
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                        initEntityWidget();

                        if (!showPreview){
                            renderSakaiDoc(contentInfo);
                        }

                    }
                });

            } else {
                sakai.api.Security.send404();
            }
        };

        var initEntityWidget = function(){
            if (sakai_global.content_profile.content_data) {
                var context = "content";
                if (sakai.data.me.user.anon) {
                    type = "content_anon";
                } else if (sakai_global.content_profile.content_data.isManager) {
                    type = "content_managed";
                } else if (sakai_global.content_profile.content_data.isViewer) {
                    type = "content_shared";
                } else {
                    type = "content_not_shared";
                }
                $(window).trigger("sakai.entity.init", [context, type, sakai_global.content_profile.content_data]);
            }
        };

        $(window).bind("sakai.entity.ready", function(){
            initEntityWidget();
        });

        $(window).bind("load.content_profile.sakai", function(e, callback) {
            loadContentProfile(callback);
        });

        var handleHashChange = function() {
            content_path = $.bbq.getState("p") || "";
            content_path = content_path.split("/");
            if (content_path[1]) {
                filename = content_path[1];
            }
            content_path = "/p/" + content_path[0];
            
            if (content_path != previous_content_path) {
                previous_content_path = content_path;
                globalPageStructure = false;
                loadContentProfile(function(){
                    // The request was successful so initialise the entity widget
                    if (sakai_global.entity && sakai_global.entity.isReady) {
                        $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                    }
                    else {
                        $(window).bind("ready.entity.sakai", function(e){
                            $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                            ready_event_fired++;
                        });
                    }
                    // The request was successful so initialise the relatedcontent widget
                    if (sakai_global.relatedcontent && sakai_global.relatedcontent.isReady) {
                        $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                    }
                    else {
                        $(window).bind("ready.relatedcontent.sakai", function(e){
                            $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                            ready_event_fired++;
                        });
                    }
                    // The request was successful so initialise the relatedcontent widget
                    if (sakai_global.contentpreview && sakai_global.contentpreview.isReady) {
                        if (showPreview) {
                            $(window).trigger("start.contentpreview.sakai");
                        }
                    }
                    else {
                        $(window).bind("ready.contentpreview.sakai", function(e){
                            if (showPreview) {
                                $(window).trigger("start.contentpreview.sakai");
                                ready_event_fired++;
                            }
                        });
                    }
                    // The request was successful so initialise the metadata widget
                    if (sakai_global.contentmetadata && sakai_global.contentmetadata.isReady) {
                        $(window).trigger("render.contentmetadata.sakai");
                    }
                    else {
                        $(window).bind("ready.contentmetadata.sakai", function(e){
                            $(window).trigger("render.contentmetadata.sakai");
                            ready_event_fired++;
                        });
                    }                   
                    sakai.api.Security.showPage();

                    // rerender comments widget
                    $(window).trigger("content_profile_hash_change");
                });
            }
            showPreview = true;
        };

        $("#entity_content_share").live("click", function(){
            $(window).trigger("init.sharecontent.sakai");
            return false;
        });

        $("#entity_content_add_to_library").live("click", function(){
            sakai.api.Content.addToLibrary(sakai_global.content_profile.content_data.data["_path"], sakai.data.me.user.userid, false, function(){
                $("#entity_content_add_to_library").hide();
                sakai.api.Util.notification.show($("#content_profile_add_library_title").html(), $("#content_profile_add_library_body").html());
            });
        });

        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Initialise the content profile page
         */
        var init = function(){
            // Bind an event to window.onhashchange that, when the history state changes,
            // loads all the information for the current resource
            $(window).bind('hashchange', function(){
                handleHashChange();
            });
            handleHashChange();
        };

        // //////////////////////////
        // Dealing with Sakai docs //
        /////////////////////////////

        var globalPageStructure = false;

        var generateNav = function(pagestructure){
            if (pagestructure) {
                $(window).trigger("lhnav.init", [pagestructure, {}, {
                    parametersToCarryOver: {
                        "p": sakai_global.content_profile.content_data.content_path.replace("/p/", "")
                    }
                }, sakai_global.content_profile.content_data.content_path]);
            }
        };

        $(window).bind("lhnav.ready", function(){
            generateNav(globalPageStructure);
        });

        var getPageCount = function(pagestructure){
            var pageCount = 0;
            for (var tl in pagestructure["structure0"]){
                if (pagestructure["structure0"].hasOwnProperty(tl)){
                    pageCount++;
                    if (pageCount >= 3){
                        return 3;
                    }
                    for (var ll in pagestructure["structure0"][tl]){
                        if (ll.substring(0,1) !== "_"){
                            pageCount++;
                            if (pageCount >= 3){
                                return 3;
                            }
                        }
                    }
                }
            }
            return pageCount;
        };

        $(window).bind("sakai.contentauthoring.needsTwoColumns", function(){
            switchToTwoColumnLayout(true);
        });

        $(window).bind("sakai.contentauthoring.needsOneColumn", function(){
            switchToOneColumnLayout(true);
        });

        var setManagerProperty = function(structure, value){
            for (var i in structure){
                structure[i]._canEdit = value;
                structure[i]._canSubedit = value;
            }
            return structure;
        };

        var renderSakaiDoc = function(pagestructure){
            pagestructure = sakai.api.Server.cleanUpSakaiDocObject(pagestructure);
            pagestructure.structure0 = setManagerProperty(pagestructure.structure0, sakai_global.content_profile.content_data.isManager);
            if (getPageCount(pagestructure) >= 3){
                switchToTwoColumnLayout(true);
            } else {
                switchToOneColumnLayout(true);
            }
            globalPageStructure = pagestructure;
            generateNav(pagestructure);
        };

        var switchToTwoColumnLayout = function(isSakaiDoc){
            $("#content_profile_left_column").show();
            $("#content_profile_main_container").addClass("s3d-twocolumn");
            $("#content_profile_right_container").addClass("s3d-page-column-right");
            $("#content_profile_right_container").removeClass("s3d-page-fullcolumn-padding");
            $("#content_profile_right_metacomments").removeClass("fl-container-650");
            $("#content_profile_right_metacomments").addClass("fl-container-450");
            if (isSakaiDoc){
                $("#content_profile_preview_container").hide();
                $("#content_profile_sakaidoc_container").show();
            } else {
                $("#content_profile_preview_container").show();
                $("#content_profile_sakaidoc_container").hide();
            }
        };

        var switchToOneColumnLayout = function(isSakaiDoc){
            $("#content_profile_left_column").hide();
            $("#content_profile_main_container").removeClass("s3d-twocolumn");
            $("#content_profile_right_container").removeClass("s3d-page-column-right");
            $("#content_profile_right_container").addClass("s3d-page-fullcolumn-padding");
            $("#content_profile_right_metacomments").addClass("fl-container-650");
            $("#content_profile_right_metacomments").removeClass("fl-container-450");
            if (isSakaiDoc){
                $("#content_profile_preview_container").hide();
                $("#content_profile_sakaidoc_container").show();
            } else {
                $("#content_profile_preview_container").show();
                $("#content_profile_sakaidoc_container").hide();
            }
        };

        // Initialise the content profile page
        init();

    };

    sakai.api.Widgets.Container.registerForLoad("content_profile");
});
