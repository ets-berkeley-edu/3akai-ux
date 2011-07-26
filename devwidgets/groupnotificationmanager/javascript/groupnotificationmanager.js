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
/* global $, Config, jQuery, sakai, sdata */

require(["jquery","sakai/sakai.api.core", "myb/myb.api.core", "config/config_custom", "/dev/javascript/myb/myb.securepage.js"],
        function($, sakai, myb, config) {
    /**
     * @name sakai_global.groupnotificationmanager
     *
     * @class groupnotificationmanager
     *
     * @description
     * Group notification manager widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.groupnotificationmanager = function(tuid, showSettings) {

        /**
         *
         * CONFIGURATION
         *
         */

        var messagesPerPage = 12; // The number of messages per page
        var allMessages = []; // Array that will hold all the messages
        var me = sakai.data.me;
        var selectedMessage = {}; // The current message
        var selectedType = 'drafts';
        var sortOrder = "descending";
        var sortBy = "date";
        var messagesForTypeCat; // The number of messages for this type/cat


        //////////////////////
        // jQuery selectors //
        //////////////////////

        /**
         * Widget's root element
         */
        var $rootElement = $("#" + tuid);







        /**
         *
         * CSS IDS
         *
         */
        var inbox = "inbox";
        var inboxID = "#inbox";
        var inboxClass = ".inbox";

        // Global vars
        var inboxGeneralMessage = inboxID + "_general_message";
        var inboxResults = inboxID + "_results";
        var inboxArrow = inboxClass + "_arrow";

        // Filters on the left side menu
        var inboxFilter = inboxID + "_filter";
        var inboxFilterClass = inboxClass + "_filter";
        var inboxFilterDrafts = inboxFilter + "_drafts";
        var inboxFilterQueue = inboxFilter + "_queue";
        var inboxFilterArchive = inboxFilter + "_archive";
        var inboxFilterTrash = inboxFilter + "_trash";
        var inboxBold = inbox + "_bold";
        var currentFilter;

        // Different panes (inbox, notification detail)
        var inboxPane = inboxID + "_pane";
        var inboxPaneClass = inboxClass + "_pane";
        var inboxPaneInbox = inboxPane + "_inbox";
        var inboxPaneMessage = inboxPane + "_message";

        // Main inbox view
        var inboxTable = inboxID + "_table";
        var inboxTablePreloader = inboxTable + "_preloader";
        var inboxTableHeader = inboxTable + "_header";
        var inboxTableHeaderFrom = inboxTableHeader + "_from";
        var inboxTableHeaderFromContent = inboxTableHeaderFrom + " span";
        var inboxTableMessage = inboxClass + "_message"; // A row in the table
        var inboxTableMessageID = inboxTable + "_message_";
        var inboxTableMessagesTemplate = inbox + "_" + inbox + "_messages_template";
        var inboxTableSubject = inboxTable + "_subject_";

        var inboxInbox = inboxID + "_inbox";
        var inboxInboxClass = inboxClass + "_inbox";

        var inboxInboxSortUp = inboxInbox + "_sort_up";
        var inboxInboxSortDown = inboxInbox + "_sort_down";

        var inboxInboxCheckAll = inboxInbox + "_checkAll";

        var inboxInboxMessage = inboxInboxClass + "_message";
        var inboxInboxHeader = inboxInboxClass + "_header";
        var inboxInboxCheckMessage = inboxInboxClass + "_check_message";

        var inboxTableHeaderSort = inboxInboxClass + "_table_header_sort";

        // Specific message
        var inboxSpecificMessage = inboxID + "_message";
        var inboxSpecificMessageBody = inboxSpecificMessage + "_body";
        var inboxSpecificMessageDate = inboxSpecificMessage + "_date";
        var inboxSpecificMessageFrom = inboxSpecificMessage + "_from";
        var inboxSpecificMessageSubject = inboxSpecificMessage + "_subject";
        var inboxSpecificMessagePicture = inboxSpecificMessage + "_picture";

        // Notification Detail (create or edit notifications)
        var inboxCompose = inboxID + "_compose";
        var inboxComposeNew = inboxCompose + "_new";
        var inboxComposeNewContainer = inboxComposeNew + "_container";
        var inboxComposeNewPanel = inboxComposeNew + "_panel";

        // Errors and messages
        var inboxGeneralMessages = inboxID + "_generalmessages";
        var inboxGeneralMessagesError = inboxGeneralMessages + "_error";
        var inboxGeneralMessagesErrorGeneral = inboxGeneralMessagesError + "_general";
        var inboxGeneralMessagesDeleted = inboxGeneralMessages + "_deleted";
        var inboxGeneralMessagesDeleted_1 = inboxGeneralMessagesDeleted + "_1";
        var inboxGeneralMessagesDeleted_x = inboxGeneralMessagesDeleted + "_x";
        var inboxGeneralMessagesMoved = inboxGeneralMessages + "_moved";
        var inboxGeneralMessagesMoved_1 = inboxGeneralMessagesMoved + "_1";
        var inboxGeneralMessagesMoved_x = inboxGeneralMessagesMoved + "_x";
        var inboxGeneralMessagesCopied = inboxGeneralMessages + "_copied";
        var inboxGeneralMessagesCopied_1 = inboxGeneralMessagesCopied + "_1";
        var inboxGeneralMessagesCopied_x = inboxGeneralMessagesCopied + "_x";
        var inboxGeneralMessagesDeletedFailed = inboxGeneralMessagesDeleted + "_failed";
        var inboxGeneralMessagesSendFailed = inboxGeneralMessages + "_send_fail";
        var inboxGeneralMessagesMovedFailed = inboxGeneralMessagesMoved + "_failed";
        var inboxGeneralMessagesCopiedFailed = inboxGeneralMessagesCopied + "_copied";

        // Keep JSLint.com happy...
        var getCount = function(){
        };
        var getAllMessages = function(){
        };

        /**
         *
         * AID FUNCTIONS
         *
         */
        var unreadMessages = 0;

        /**
         * This will show the preloader.
         */
        var showLoader = function(){
            $(inboxTable).append(sakai.api.Util.TemplateRenderer(inboxTablePreloader.substring(1), {}));
        };

        /**
         * Scroll to a specific element in a page.
         * @param {Object} element The element you want to scroll to.
         */
        var scrollTo = function(element){
            $("html, body").animate({
                scrollTop: element.offset().top
            }, 1);
        };

        /**
         * Shows a general message on the top screen.
         * @param {String} msg The message you want to display.
         * @param {Boolean} isError True for error (red block) or false for normal message(green block).
         */
        var showGeneralMessage = function(msg, isError){
            // Check whether to show an error type message or an information one.
            var type = isError ? sakai.api.Util.notification.type.ERROR : sakai.api.Util.notification.type.INFORMATION;

            // Show the message to the user.
            sakai.api.Util.notification.show("", msg, type);
        };

        /**
         * This will hide all the panes.
         */
        var hideAllPanes = function(){
            $(inboxPaneClass).hide();
        };

        /**
         * Will show the required pane and hide all the others.
         * @param {String} pane The id of the pane you want to show.
         */
        var showPane = function(pane){
            // We do a check to see if the pane isn't already visible.
            // Otherwise, we get an annoying flicker.
            if (!$(pane).is(":visible")) {
                hideAllPanes();
                $(pane).show();
            }
        };

        /**
         * Check or uncheck all messages depending on the top checkbox.
         */
        var tickMessages = function(){
            $(inboxInboxCheckMessage).attr("checked", ($(inboxInboxCheckAll).is(":checked") ? "checked" : ''));
        };

        /**
         * test if the current browser supports the ellipsis overflow
         */
        var browserSupportsCSS3textOverflow = function () {
            // TODO: Test in IE9
            if($.browser.msie) return false; // ellipsis doesn't work correctly in IE8
            var style = document.documentElement.style;
            return ('textOverflow' in style || 'OTextOverflow' in style);
        }

        /**
         * Cuts off and adds ellipsis to the end of subject titles that exceed 1 row.
         * the normal text-overflow: ellipsis doesn't work in some browsers (eg. Firefox)
         * so we whether this feature exists and then apply the style or the ThreeDots jQuery plugin
         */
        var ellipsisSubjects = function(){
            if (browserSupportsCSS3textOverflow()) {
                $(".subject-td p a.ellipsis_text").each(function(){
                    $(this).css({
                        "text-overflow": "ellipsis",
                        "-o-text-overflow": "ellipsis",
                        // Encountered problems with Firefox, disabling the property below for now
                        //"-moz-binding": "url('bindings.xml#ellipsis')",
                        "white-space": "nowrap",
                        "overflow": "hidden",
                        "display": "inline-block",
                        "max-width": "100%"
                    });
                });
            } else {
                $(".subject-td p").each(function(){
                    $(this).ThreeDots({
                        max_rows: 1,
                        whole_word: false
                    });
                });
            }
        };

        /**
         * This will display the first page of the specified messages.
         * @param {String} type The type of the messages (inbox, queue, archive, trash or * for all of them).
         * @param {String} read Whether we should fetch messages that are read, unread or all of them. (options: true, false, all)
         * @param {String} id The id of the filter that got clicked in the side panel.
         */
        var filterMessages = function(type, read, id){
            // The small header/titlebar above the current pane.
            $(inboxInboxHeader).hide();
            $(inboxID + "_" + type).show();

            // Remember the type we want to see.
            selectedType = type;

            // Display the first page of msgs.
            showPage();

            // Show the inbox pane.
            showPane(inboxPaneInbox);

            // Set the title bold.
            $(inboxFilterClass).removeClass(inboxBold);
            $(id).addClass(inboxBold);
        };

        /**
         * Removes all the messages out of the DOM.
         * It will also remove the preloader in the table.
         */
        var removeAllMessagesOutDOM = function(){
            $(inboxTableMessage).remove();
        };


        /**
         *
         * RENDER MESSAGES
         *
         */

        /**
         * Used for the date formatter.
         */
        var replaceChars = {
            date: new Date(),
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

            // Day
            d: function(){
                return (replaceChars.date.getDate() < 10 ? '0' : '') + replaceChars.date.getDate();
            },
            D: function(){
                return replaceChars.shortDays[replaceChars.date.getDay()];
            },
            j: function(){
                return replaceChars.date.getDate();
            },
            l: function(){
                return replaceChars.longDays[replaceChars.date.getDay()];
            },
            N: function(){
                return replaceChars.date.getDay() + 1;
            },
            S: function(){
                return (replaceChars.date.getDate() % 10 === 1 && replaceChars.date.getDate() !== 11 ? 'st' : (replaceChars.date.getDate() % 10 === 2 && replaceChars.date.getDate() !== 12 ? 'nd' : (replaceChars.date.getDate() % 10 === 3 && replaceChars.date.getDate() !== 13 ? 'rd' : 'th')));
            },
            w: function(){
                return replaceChars.date.getDay();
            },
            z: function(){
                return "Not Yet Supported";
            },
            // Week
            W: function(){
                return "Not Yet Supported";
            },
            // Month
            F: function(){
                return replaceChars.longMonths[this.getMonth()];
            },
            m: function(){
                return (replaceChars.date.getMonth() < 11 ? '0' : '') + (replaceChars.date.getMonth() + 1);
            },
            M: function(){
                return replaceChars.shortMonths[replaceChars.date.getMonth()];
            },
            n: function(){
                return replaceChars.date.getMonth() + 1;
            },
            t: function(){
                return "Not Yet Supported";
            },
            // Year
            L: function(){
                return "Not Yet Supported";
            },
            o: function(){
                return "Not Supported";
            },
            Y: function(){
                return replaceChars.date.getFullYear();
            },
            y: function(){
                return ('' + replaceChars.date.getFullYear()).substr(2);
            },
            // Time
            a: function(){
                return replaceChars.date.getHours() < 12 ? 'am' : 'pm';
            },
            A: function(){
                return replaceChars.date.getHours() < 12 ? 'AM' : 'PM';
            },
            B: function(){
                return "Not Yet Supported";
            },
            g: function(){
                return replaceChars.date.getHours() % 12 || 12;
            },
            G: function(){
                return replaceChars.date.getHours();
            },
            h: function(){
                return ((replaceChars.date.getHours() % 12 || 12) < 10 ? '0' : '') + (replaceChars.date.getHours() % 12 || 12);
            },
            H: function(){
                return (replaceChars.date.getHours() < 10 ? '0' : '') + replaceChars.date.getHours();
            },
            i: function(){
                return (replaceChars.date.getMinutes() < 10 ? '0' : '') + replaceChars.date.getMinutes();
            },
            s: function(){
                return (replaceChars.date.getSeconds() < 10 ? '0' : '') + replaceChars.date.getSeconds();
            },
            // Timezone
            e: function(){
                return "Not Yet Supported";
            },
            I: function(){
                return "Not Supported";
            },
            O: function(){
                return (replaceChars.date.getTimezoneOffset() < 0 ? '-' : '+') + (replaceChars.date.getTimezoneOffset() / 60 < 10 ? '0' : '') + (replaceChars.date.getTimezoneOffset() / 60) + '00';
            },
            T: function(){
                return "Not Yet Supported";
            },
            Z: function(){
                return replaceChars.date.getTimezoneOffset() * 60;
            },
            // Full Date/Time
            c: function(){
                return "Not Yet Supported";
            },
            r: function(){
                return replaceChars.date.toString();
            },
            U: function(){
                return replaceChars.date.getTime() / 1000;
            }
        };


        /**
         * Format a date to a string.
         * See replaceChars for the specific options.
         * @param {Date} d
         * @param {String} format
         */
        var formatDate = function(d, format){
            var returnStr = '';
            replaceChars.date = d;
            var replace = replaceChars;
            for (var i = 0; i < format.length; i++) {
                var curChar = format.charAt(i);
                if (replace[curChar]) {
                    returnStr += replace[curChar].call(d);
                }
                else {
                    returnStr += curChar;
                }
            }
            return returnStr;
        };

        /**
         * Adds the correct format to a message.
         * ex: parsing the date
         * @param {Object} message
         */
        var formatMessage = function(message){
            var dateString = message["sendDate"];
            if (typeof dateString === "string" && dateString != "null") {
                var d = new Date();
                d.setFullYear(parseInt(dateString.substring(0, 4), 10));
                d.setMonth(parseInt(dateString.substring(5, 7), 10) - 1);
                d.setDate(parseInt(dateString.substring(8, 10), 10));
                d.setHours(parseInt(dateString.substring(11, 13), 10));
                d.setMinutes(parseInt(dateString.substring(14, 16), 10));
                d.setSeconds(parseInt(dateString.substring(17, 19), 10));
                //Jan 22, 2009 10:25 PM
                message.date = formatDate(d, "M j, Y");
            }
            if (message.previousMessage) {
                message.previousMessage = formatMessage(message.previousMessage);
            }

            // pictures
            if (message.userFrom && $.isArray(message.userFrom)) {
                for (var i = 0, il = message.userFrom.length; i < il; i++) {
                    if (message.userFrom[i].picture && $.parseJSON(message.userFrom[i].picture).name) {
                        message.userFrom[i].photo = $.parseJSON(message.userFrom[i].picture).name;
                    }
                }
            }
            if (message.userTo && $.isArray(message.To)) {
                for (var j = 0, jl = message.userTo.length; j < jl; j++) {
                    if (message.userTo[j].picture && $.parseJSON(message.userTo[j].picture).name) {
                        message.userTo[j].photo = $.parseJSON(message.userTo[j].picture).name;
                    }
                }
            }

            return message;
        };

        /**
         * Renders the messages.
         * @param {Object} The JSON response from the server. Make sure it has a .message array in it.
         */
        var renderMessages = function(response){
            for (var j = 0, l = response.results.length; j < l; j++) {
                // temporary internal id.
                // Use the name for the id.
                response.results[j].nr = j;
                if ( response.results[j].type != "message") {
                    response.results[j].subject = response.results[j].calendarWrapper.icalData.SUMMARY;
                    response.results[j].body = response.results[j].calendarWrapper.icalData.DESCRIPTION;
                }
                response.results[j].messagebox = response.results[j]["sakai:messagebox"];
                response.results[j].validated = response.results[j].uxState.validated;
                response.results[j] = formatMessage(response.results[j]);
            }

            allMessages = response.results;

            messagesForTypeCat = response.total;

            // show messages
            var tplData = {
                "messages": response.results,
                sakai : sakai
            };

            // remove previous messages
            removeAllMessagesOutDOM();

            // add them to the DOM
            $(inboxTable).children("tbody").append(sakai.api.Util.TemplateRenderer(inboxTableMessagesTemplate, tplData));

            // do checkboxes
            tickMessages();

            // do ellipsis
            ellipsisSubjects();
        };

        /**
         * Show a certain page of messages.
         */
        var showPage = function(){
            // Remove all messages.
            // remove previous messages.
            removeAllMessagesOutDOM();

            // Show set of messages.
            // Using callback function to update the pager AFTER all messages have been loaded.
            getAllMessages();
        };

        /**
         *
         * SERVER FUNCTIONS
         *
         **/

        /**
         * Gets all the messages from the JCR.
         */
        var getAllMessages = function(callback){
            var url = "/var/notifications/search.json?items=" +
                    config.Search.MAX_CORRECT_SEARCH_RESULT_COUNT + "&box=" + selectedType;

            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    if (data.results) {
                        // Render the messages
                        renderMessages(data);
                    }
                    if ($.isFunction(callback)) {
                        callback();
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    showGeneralMessage($(inboxGeneralMessagesErrorGeneral).text());
                    // Commented out because this displays the tiny bit of text at the bottom of the panel that
                    // says an error has occurred. Felt this was a bit redundant to have both the text and a
                    // popup alerting the user that there was an error, and also, the error message does not
                    // ever disappear for the remainder of the time the user spends on this page (unless they
                    // refresh or leave and come back).
                    //$(inboxResults).html(sakai.api.Security.saneHTML($(inboxGeneralMessagesErrorGeneral).text()));
                }
            });
        };


        /**
         *
         * DISPLAY SPECIFIC MESSAGE
         *
         */

        /**
         * Get the message out of the list with the specific id.
         * @param {String} id The id of a message.
         */
        var getMessageWithId = function(id){
            for (var i = 0, j = allMessages.length; i < j; i++) {
                if (allMessages[i]["jcr:name"] === id) {
                    return allMessages[i];
                }
            }
            return {};
        };


        /**
         * Displays only the message with that id.
         * @param {String} id The id of a message.
         */
        var displayMessage = function(id){
            // get the specific message data...
            selectedMessage = getMessageWithId(id);
            if (typeof selectedMessage !== "undefined") {
                var messageBox = selectedMessage["sakai:messagebox"];

                // Show the correct nofitication detail pane to get ready for the widget.
                $.bbq.pushState({edit: id});
                //showPane(inboxPaneCompose);

                // Initialise the widget, which will prepopulate the fields and
                // set the correct buttonlist based on where it was called from.
                //sakai_global.composenotification.initialise(messageBox, selectedMessage);

                // Unhighlight all tabs.
                //$("[id|=tab]").removeClass("current_tab");
            }
        };

        /**
         *
         * DELETING A MESSAGE
         *
         **/

        /**
         * Removes all the messages from memory that are in pathToMessages if success = true
         * success = false will show an error.
         * @param {String[]} pathToMessages
         * @param {Boolean} success
         */
        var deleteMessagesFinished = function(pathToMessages, success){
            if (success) {
                showPage();

                var txt = "";
                if (pathToMessages.length === 1) {
                    txt = $(inboxGeneralMessagesDeleted_1).text();
                }
                else {
                    txt = pathToMessages.length+" "+$(inboxGeneralMessagesDeleted_x).text();
                }

                showGeneralMessage(txt, false);
            }
            else {
                showGeneralMessage($(inboxGeneralMessagesDeletedFailed).text());
            }
        };

        /**
         * This will do a DELETE request to the specified path and harddelete that message.
         * @param {String[]} path The message that you want to delete.
         * @param {int} index The index of the array that needs to be deleted.
         */
        var hardDeleteMessage = function(pathToMessages) {
            var requests = [];
            $(pathToMessages).each(function(i,val) {
                var req = {
                    "url": val,
                    "method": "POST",
                    "parameters": {
                        ":operation": "delete"
                    }
                };
                requests.push(req);
            });
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                success: function(data) {
                    deleteMessagesFinished(pathToMessages, true);
                },
                error: function(xhr, textStatus, thrownError) {
                   deleteMessagesFinished(pathToMessages, false);
                }
            });
        };

        /**
         * Delete all the messages that are in path.
         * Hard delete is for if we are calling this from the trash pane.
         * @param {Array} pathToMessages An array of ids that have to be deleted.
         * @ param {boolean} hardDelete Are we calling this from trash?
         */
        var deleteMessages = function(pathToMessages, hardDelete){
            if (typeof hardDelete === "undefined") {
                hardDelete = false;
            }
            if (hardDelete) {
                // We will have to do a hard delete to all the JCR files.
                hardDeleteMessage(pathToMessages);
            }
            else {
                var toDelete = pathToMessages.length;
                var deleted = 0;

                for (var d = 0, e = pathToMessages.length; d < e; d++) {
                    $.ajax({
                        url: pathToMessages[d],
                        type: "POST",
                        success: function(data){
                            deleted++;
                            if (deleted === toDelete) {
                                deleteMessagesFinished(pathToMessages, true);
                            }
                        },
                        error: function(xhr, textStatus, thrownError){
                            deleted++;
                            if (deleted === toDelete) {
                                deleteMessagesFinished(pathToMessages, false);
                            }
                        },
                        data: {
                            "sakai:messagebox": "trash",
                            "_charset_": "utf-8"
                        }
                    });
                }
            }
        };

        /**
         * Delete all checked messages on current page.
         */
        var deleteChecked = function(){
            // pathToMessages = an array of all checked messages
            var pathToMessages = [];
            $(inboxInboxCheckMessage + ":checked").each(function(){
                var pathToMessage = $(this).val();
                pathToMessages.push(pathToMessage);
            });

            // Reset 'Check All' checkbox just in case it's clicked.
            $(inboxInboxCheckAll).attr("checked", false);

            // If we are in trash we hard delete the messages.
            deleteMessages(pathToMessages, (selectedType === sakai.config.Messages.Types.trash));
        };

        var moveMessagesFinished = function(pathToMessages, success, toWhere){
            if (success) {

                showPage();

                var txt = "";
                if (pathToMessages.length === 1) {
                    txt = $(inboxGeneralMessagesMoved_1).text()+" "+toWhere+".";
                }
                else {
                    txt = pathToMessages.length+" "+$(inboxGeneralMessagesMoved_x).text()+" "+toWhere+".";
                }

                showGeneralMessage(txt, false);
            }
            else {
                showGeneralMessage($(inboxGeneralMessagesMovedFailed).text());
            }
        };

        var moveMessages = function(pathToMessages, toWhere){
            var toMove = pathToMessages.length;
            var moved = 0;

            for (var d = 0, e = pathToMessages.length; d < e; d++) {
                $.ajax({
                    url: pathToMessages[d],
                    type: "POST",
                    success: function(data){
                        moved++;
                        if (moved === toMove) {
                            moveMessagesFinished(pathToMessages, true, toWhere);
                        }
                    },
                    error: function(xhr, textStatus, thrownError){
                        moved++;
                        if (moved === toMove) {
                            moveMessagesFinished(pathToMessages, false);
                        }
                    },
                    data: {
                        "sakai:messagebox": toWhere,
                        "_charset_": "utf-8"
                    }
                });
            }
        }

        var moveChecked = function(toWhere){
            // pathToMessages = an array of all checked messages
            var pathToMessages = [];
            $(inboxInboxCheckMessage + ":checked").each(function(){
                var pathToMessage = $(this).val();
                pathToMessages.push(pathToMessage);
            });

            // Reset 'Check All' checkbox just in case it's clicked.
            $(inboxInboxCheckAll).attr("checked", false);

            moveMessages(pathToMessages, toWhere);
        }

        /**
         * Moves selected drafts to Queue message box.
         * Messages that have incomplete information are ignored.
         */
        var moveSelectedDraftsToQueue = function(){

            var pathToMessages = [];

            // Here we store number of skipped not validated messages
            var numberOfSkippedMessages = 0;

            $(inboxInboxCheckMessage + ":checked").each(function(){
                var pathToMessage = $(this).val();

                var validated = false;
                if (this.id) {
                    // We need to know the name of the hidden input field that contains information about validation
                    // Replacing checkbox id's prefix here to create the hidden validation field's id
                    var msgValidatedInputId = this.id.replace(/^inbox_check_delete_/, "drafts_message_validated_");
                    // Checking if the message was validated
                    validated = $("#" + msgValidatedInputId).val() === "true";
                }

                if (validated) {
                    pathToMessages.push(pathToMessage);
                } else {
                    numberOfSkippedMessages++;
                }
            });

            // Reset 'Check All' checkbox just in case it's clicked.
            $(inboxInboxCheckAll).attr("checked", false);

            moveMessages(pathToMessages, "queue");

            if (numberOfSkippedMessages !== 0) {
                showGeneralMessage("Some of the messages could not be queued because they are not complete.", true);
            }
        };

        var copyMessagesFinished = function(pathToMessages, success, toWhere){
            if (success) {
                showPage();

                var txt = "";
                if (pathToMessages.length === 1) {
                    txt = $(inboxGeneralMessagesCopied_1).text()+toWhere+".";
                }
                else {
                    txt = pathToMessages.length+" "+$(inboxGeneralMessagesCopied_x).text()+" "+toWhere+".";
                }

                showGeneralMessage(txt, false);
            }
            else {
                showGeneralMessage($(inboxGeneralMessagesCopiedFailed).text());
            }
        };

        var copyMessages = function(pathToMessages, toWhere){
            var toCopy = pathToMessages.length;
            var copied = 0;

            for (var d = 0, e = pathToMessages.length; d < e; d++) {
                // For all the messages, extract the message id from the jcr path url
                // and then use that to find the appropriate message.
                var url = pathToMessages[d];
                var pieces = url.split("/");
                var message = getMessageWithId(pieces[pieces.length-1]);

                // clone the old message
                var newMessage = $.extend(true, {}, message);

                // and replace some of its fields
                newMessage.calendarWrapper.icalData.SUMMARY = "Copy of " + message.calendarWrapper.icalData.SUMMARY;
                newMessage["sakai:messagebox"] = toWhere;
                delete newMessage["id"];
                delete newMessage["jcr:path"];
                delete newMessage["jcr:name"];

                $.ajax({
                    url: "/user/" + me.user.userid + "/.myb-notificationstore.html",
                    type: "POST",
                    data: { notification : $.toJSON(newMessage) },
                    success: function(data){
                        copied++;
                        if (copied === toCopy) {
                            copyMessagesFinished(pathToMessages, true, toWhere);
                        }
                    },
                    error: function(xhr, textStatus, thrownError){
                        copied++;
                        if (copied === toCopy) {
                            copyMessagesFinished(pathToMessages, false);
                        }
                    }
                });
            }
        }

        var copyChecked = function(toWhere){
            // pathToMessages = an array of all checked messages
            var pathToMessages = [];
            $(inboxInboxCheckMessage + ":checked").each(function(){
                var pathToMessage = $(this).val();
                pathToMessages.push(pathToMessage);
            });

            // Reset 'Check All' checkbox just in case it's clicked.
            $(inboxInboxCheckAll).attr("checked", false);

            copyMessages(pathToMessages, toWhere);
        };


        /**
         *
         * EVENT HANDLING
         *
         */
        // For when user clicks on "Create New" button.
        $("#inbox-new-button").live("click", function(){
            $.bbq.removeState("edit");
            $.bbq.pushState({"new": true});
        });

        // For when user cancels notification authoring (cancel button on pane 2).
        /*$("#cn-cancel-button").live("click", function(){
            // jump back to previous pane
            showPane(inboxPaneInbox);
            $(".inbox_inbox_header").each(function(){
                if ($(this).is(":visible")) {
                    correctHighlightedTab($(this).attr("id").substring(6, $(this).attr("id").length));
                }
            });
            $(inboxInboxCheckAll).attr("checked", false);
            $("#inbox-new-button").show();
        });*/

        var showFilteredList = function (filter, boxID) {
            currentFilter = filter
            filterMessages(filter, "all", boxID);
            correctButtonList(filter);
            correctHighlightedTab(filter);
            $(inboxInboxCheckAll).attr("checked", false);
        };


        /**
         *
         * OPERATIONS ON MULTIPLE CHECKED MESSAGES
         *
         */
        // Check all messages.
        $(inboxInboxCheckAll).change(function(){
            tickMessages();
        });

        // Delete all checked messages on drafts page.
        $("#inbox-draftsdelete-button").click(function() {
            deleteChecked();
        });

        // Copy the checked messages on the drafts page to drafts.
        $("#inbox-draftscopy-button").click(function() {
            copyChecked("drafts");
        });

        // Move the checked messages to queue.
        $("#inbox-movetoqueue-button").click(function(){
            moveSelectedDraftsToQueue();
        });

        // Move all checked messages from queue to drafts.
        $("#inbox-queuetodrafts-button").click(function() {
            moveChecked("drafts");
        });

        // Copy all checked messages from queue to drafts.
        $("#inbox-queuecopytodrafts-button").click(function() {
            copyChecked("drafts");
        });

        // Delete all checked messages on queue page.
        $("#inbox-queuedelete-button").click(function() {
            deleteChecked();
        });

        // Copy all checked messages from archive to drafts.
        $("#inbox-archivetodrafts-button").click(function(){
            copyChecked("drafts");
        });

        // Move all checked messages from trash to drafts.
        $("#inbox-trashtodrafts-button").click(function(){
            moveChecked("drafts");
        });

        // Empty the trash. (currently acts only on checked messages)
        $("#inbox-emptytrash-button").click(function(){
            deleteChecked();
        });

        /**
         *
         * SHOW A SPECIFIC MESSAGE
         *
         */
        $(inboxInboxMessage).live("click", function(e, ui){
            var id = e.target.id;
            id = id.split('_');
            displayMessage(id[id.length - 1]);
        });

        /**
         * Highlights the current filter the user is on.
         * First unhighlights all tabs, then correctly highlights the current tab.
         * @param {Object} type The type of filter whose tab we want highlighted.
         */
        var correctHighlightedTab = function(type){
            $("[id|=tab]").removeClass("current_tab");
            $("#tab-"+type).addClass("current_tab");
        };

        /**
         * Toggles the bottom button list between filters.
         * First hides all visible button lists, then displays the correct one.
         * @param {Object} type The type of filter whose button list we want visible.
         */
        var correctButtonList = function(type) {
            $("[id|=buttons]").hide();
            $("#buttons-"+type).show();
        };

        // Sorters for the inbox.
        $(inboxTableHeaderSort).bind("mouseenter", function(){
            if (sortOrder === 'descending') {
                $(this).append(sakai.api.Security.saneHTML($(inboxInboxSortUp).html()));
            }
            else {
                $(this).append(sakai.api.Security.saneHTML($(inboxInboxSortDown).html()));
            }
        });
        $(inboxTableHeaderSort).bind("mouseout", function(){
            $(inboxTable + " " + inboxArrow).remove();
        });
        $(inboxTableHeaderSort).bind("click", function(){
            sortBy = $(this).attr("id").replace(/inbox_tableHeader_/gi, "");
            sortOrder = (sortOrder === "descending") ? "ascending" : "descending";

            getAllMessages();
        });

        ////////////////////////////////
        // Hashchange events handling //
        ////////////////////////////////

        /**
         * Sets current state of this component (list mode or edit mode).
         * This function is called when hashchange event fires.
         */
         var setState = function() {

            var state = $.bbq.getState();

            if (!(state.hasOwnProperty("l") && state.l.indexOf("notifications/") === 0)) {
                return;
            }

            if (state.hasOwnProperty("new") || state.hasOwnProperty("edit")) {
                $rootElement.hide();
                return;
            }
            var box;
            if (state.hasOwnProperty("l")) {
                box = state.l;
            }

            if (box === "notifications/drafts") {
                showFilteredList("drafts", inboxFilterDrafts);
                $("#inbox-new-button").show();
            } else if (box === "notifications/queue") {
                showFilteredList("queue", inboxFilterQueue);
                $("#inbox-new-button").show();
            } else if (box === "notifications/archive") {
                showFilteredList("archive", inboxFilterArchive);
                $("#inbox-new-button").show();
            } else if (box === "notifications/trash") {
                showFilteredList("trash", inboxFilterTrash);
                $("#inbox-new-button").show();
            }

            $rootElement.show();


        };

        $(window).bind('hashchange', function() {
            setState();
        });
        
        /////////////////////////////
        // Initialization function //
        /////////////////////////////


        var doInit = function(){

            // if the user is not a member of the advisers group then bail
            if (!myb.api.security.isUserAnAdviser()) {
                sakai.api.Security.send403();
                return;
            }

            setState();

             // TODO: HACK: To prevent flickering this widget was made invisible in HTML code, need to undo this
            $("div.groupnotificationmanager_widget", $rootElement).show();

        };

        doInit();
    };


    sakai.api.Widgets.widgetLoader.informOnLoad("groupnotificationmanager");

});