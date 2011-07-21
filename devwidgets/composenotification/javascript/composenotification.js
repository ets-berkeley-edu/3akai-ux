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

/*global $, sdata, opensocial, Config */

require(["jquery", "/dev/lib/myb/jquery/jquery-ui-datepicker.min.js", "sakai/sakai.api.core", "myb/myb.api.core"], function($, $datepick, sakai, myb) {

    /**
     * @name sakai_global.composenotification
     *
     * @class composenotification
     *
     * @description
     * Compose notification widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.composenotification = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        /**
         * Id of a message being edited (or null for new messages)
         */
        var currentMessageId = null;

        /**
         * A message being edited (or null for new messages)
         */
        var currentMessage = null;

        /**
         * User object that contains the information for the user that should be posted to
         */
        var user = false;

        /**
         * Shortcut for data.me property
         */
        var me = sakai.data.me;

        /**
         * Determines whether a notification has changed since it was last created or saved
         */
        var isDirty = false;

        /**
         * Invalid class for field validation.
         */
        var invalidClass = "composenotification_invalid";

        /**
         *
         * EVENT TIME KEY-VALUE PAIRS
         * (used for populating the drop-down menus)
         *
         */
        // Various arrays for event time picking.
        var allHourOptions = {
            '1' : '01',
            '2' : '02',
            '3' : '03',
            '4' : '04',
            '5' : '05',
            '6' : '06',
            '7' : '07',
            '8' : '08',
            '9' : '09',
            '10' : '10',
            '11' : '11',
            '12' : '12'
        };

        var allMinuteOptions = {
            '0' : '00',
            '15' : '15',
            '30' : '30',
            '45' : '45'
        };

        var allAMPMOptions = {
            'AM' : 'AM',
            'PM' : 'PM'
        };

        var saveEnabled = true;

        /**
         * The overlay transparency as a percentage. If 0 the overlay is disabled, and the page will remain interactive.
         * If 100 the overlay will be 100% opaque.
         */
        var dialogOverlayTransparency = 20;

        var datePickerButtonImageUrl = "/devwidgets/composenotification/images/calendar_icon.gif";


         //////////////////////
        // jQuery selectors //
        //////////////////////

        /**
         * Widget's root element
         */
        var $rootElement = $("#" + tuid);

        var $messageFieldType = $("#cn-notification-type", $rootElement);
        var $messageFieldRequiredCheck = $("#composenotification_required", $rootElement);
        var $messageRequiredYes = $("#cn-requiredyes", $rootElement);
        var $messageRequiredNo = $("#cn-requiredno", $rootElement);
        var $messageFieldSendDate = $("#datepicker-senddate-text", $rootElement);
        var $messageFieldTo = $("#cn-dynamiclistselect", $rootElement);
        var $messageFieldSubject = $("#cn-subject", $rootElement);
        var $messageFieldBody = $("#cn-body", $rootElement);
        var $messageTaskDueDate = $("#datepicker-taskduedate-text", $rootElement);
        var $messageEventDate = $("#datepicker-eventdate-text", $rootElement);
        var $messageEventTimeHour = $("#cn-event-timehour", $rootElement);
        var $messageEventTimeMinute = $("#cn-event-timeminute");
        var $messageEventTimeAMPM = $("#cn-event-timeampm");
        var $messageEventPlace = $("#cn-event-place");

        var $taskDueDateContainer = $("#composenotification_task_due_date", $rootElement);
        /**
         * Container element for var $messageEventTimeHour, $messageEventTimeMinute and $messageEventTimeAMPM
         */
        var $eventTimeContainer = $("#composenotification_event_time", $rootElement);
        var $eventDateContainer = $("#composenotification_event_date", $rootElement);
        var $eventPlaceContainer = $("#composenotification_event_place", $rootElement);

        /**
         * For dialog-overlay to remind user to save their draft.
         * (When user clicks on 'Create New DyNamic List' button.)
         */
        var $saveReminderDialog = $("#save_reminder_dialog", $rootElement).jqm({
            modal: true,
            overlay: dialogOverlayTransparency,
            toTop: true,
            onShow: null
        }).css("position", "absolute").css("top", "250px");

        var $createNewDynamicListButton = $("#create-new-dynamic-list-button", $rootElement);
        var $widgetTitle = $("#cn-widget-title", $rootElement);



        //////////////////////////
        // UI related functions //
        //////////////////////////

        /**
         * Get the internationalised value for a specific key.
         * @param {String} key The key which you want to be translated
         */
        var translate = function(key) {
            return sakai.api.i18n.Widgets.getValueForKey("composenotification", "default", key);
        };

        var formatISO8601 = function(date) {
            var gmtDate = sakai.api.Util.Datetime.toGMT(date);
            return Globalization.format(gmtDate, "yyyy-MM-ddTHH:mm:ssZ"); // eg 2011-06-30T00:00:00-07:00
        };

        /**
         * Shows a general message on the top screen.
         * @param {String} msg The message you want to display.
         * @param {Boolean} isError True for error (red block) or false for normal message(green block).
         */
        var showGeneralMessage = function(msg, isError) {
            // Check whether to show an error type message or an information one.
            var type = isError ? sakai.api.Util.notification.type.ERROR : sakai.api.Util.notification.type.INFORMATION;

            // Show the message to the user.
            sakai.api.Util.notification.show("", msg, type);
        };

        /**
         * Re-enables previously disabled fields.
         */
        var reenableView = function() {
            $(".compose-form-elm", $rootElement).removeAttr("disabled");
            $('input[id|=datepicker]', $rootElement).each(function() {
                var buttonImagePath = $(this).datepicker("option", "buttonImage");
                var buttonImage = $("img[src$='" + buttonImagePath + "']");
                $(buttonImage).show();
            });
            $createNewDynamicListButton.show();
        };

        /**
         * Disables proper elements of the compose-form-elm class for the
         * notification authoring page. (used to create a non-editable mode)
         */
        var disableView = function() {
            $(".compose-form-elm", $rootElement).attr("disabled", "disabled");
            $('input[id|=datepicker]', $rootElement).each(function() {
                var buttonImagePath = $(this).datepicker("option", "buttonImage");
                var buttonImage = $("img[src$='" + buttonImagePath + "']");
                $(buttonImage).hide();
            });
            $createNewDynamicListButton.hide();
        };

        /**
         * Removes invalidClass from all elements that are currently within that class.
         */
        var clearInvalids = function() {
            $("." + invalidClass, $rootElement).removeClass(invalidClass);
        };

        /**
         * Resets whatever element it is passed as a parameter, as long as it is of
         * the text, textarea, checkbox, or radiobox type/tag.
         * @param {Object} toClear The element to reset.
         */
        var clearElement = function(toClear) {
            var type = toClear.type;
            var tag = toClear.tagName.toLowerCase();

            if (type === "text" || tag === "textarea") {
                toClear.value = "";
            } else if (type === "checkbox" || type === "radio") {
                toClear.checked = false;
            }
        };

        /**
         * Initializes the form according to the selected notification type
         * @param {String} type One of the following values: message, task or event
         */
        var notificationTypeInit = function (type) {

            clearInvalids();

            if ( type === "message" ) {
                $eventDateContainer.hide();
                $eventTimeContainer.hide();
                $eventPlaceContainer.hide();
                $taskDueDateContainer.hide();
                $messageRequiredNo.attr("checked", "checked");
                $("#composenotification_required .right input", $rootElement).attr("disabled", "disabled");
                $messageFieldRequiredCheck.hide();
            } else if (type === "task") {
                $eventDateContainer.hide();
                $eventTimeContainer.hide();
                $eventPlaceContainer.hide();
                $messageTaskDueDate.val("");
                $taskDueDateContainer.show();
                $messageRequiredYes.attr("checked", "checked");
                $("#composenotification_required .right input", $rootElement).attr("disabled", "disabled");
                $messageFieldRequiredCheck.show();

            } else {
                eventTimeInit(null, null, null);
                $eventTimeContainer.show();
                $messageEventDate.val("");
                $eventDateContainer.show();
                $messageEventPlace.val("");
                $eventPlaceContainer.show();
                $taskDueDateContainer.hide();
                $messageRequiredYes.removeAttr("checked");
                $messageRequiredNo.removeAttr("checked");
                $messageFieldRequiredCheck.show();
                $("#composenotification_required .right input", $rootElement).removeAttr("disabled");
            }
        };

        /**
         * Hide all the button lists (usually called as
         * part of resetting the page).
         */
        var hideAllButtonLists = function() {
            $(".notifdetail-buttons", $rootElement).hide();
        };

        /**
         * This will reset the whole widget to its default state.
         * It will clear any values or texts that might have been entered.
         * Should be called every time the widget is initialised.
         */
        var resetForm = function() {

            $(".compose-form-elm", $rootElement).each(function() {
                clearElement(this);
            });

            clearInvalids();

            hideAllButtonLists();

            $messageFieldType.val("task");

            eventTimeInit(null, null, null);

            reenableView();
            // Must be called after reenableView because it disables 'Required?' radio buttons
            notificationTypeInit("task");

            // Resetting dynamic lists
            $messageFieldTo.empty();

            isDirty = false;

            saveEnabled = true;
            $("#composenotification_box .s3d-button", $rootElement).removeClass("disabled");
        };



        ///////////////////////////////////////////////////////////
        // Dynamic lists drop-down menu initialization functions //
        ///////////////////////////////////////////////////////////


        /**
         * Returns a string containing a set of option elements.
         * @param {Object} optionArray Key-value pairs of option elements.
         * @param {String} selectedValue The key of the element option we want to select.
         * @param {Boolean} firstEmpty Start with an option element or not.
         */
        var createOptions = function (optionArray, selectedValue, firstEmpty) {
            var makeOption = function (val, title, selectedTorF) {
                var valString = (val) ? " value='" + val + "'" : "";
                var selectedString = (selectedTorF) ? " selected='selected'" : "";
                // escaping < and > with \x3C and \x3E
                return "\x3Coption " + valString + selectedString + "\x3E" + title + "\x3C/option\x3E\n";
            };
            var optionsString = "";

            if (firstEmpty) {
                // if the first selected value is empty then select the first element in the list
                optionsString += makeOption(null, "", (selectedValue === null || selectedValue === ""));
            }
            for (var key in optionArray) {
                optionsString += makeOption(key, optionArray[key], (selectedValue == key));
            }
            return optionsString;
        };

        /*
         * Sets up drop down menu for Dynamic List field (or otherwise known as
         * the 'Send To' field) based on the array pre-defined earlier in the JS.
         */
        var dynamicListInit = function(selectedID) {
            sakai.api.Server.loadJSON("/~" + me.user.userid + "/private/dynamic_lists.1.json", function(success, data) {

                if (success) {
                    // Iterate through data and make new array for createOptions.
                    var dynamicListOptions = {};
                    for (var element in data) {
                      var optionValue = data[element]["_path"];
                      dynamicListOptions[optionValue] = data[element]["sakai:name"];
                    }

                    // Call createOptions with our new array.
                    var optionsHTML = createOptions(dynamicListOptions, selectedID, true);
                }

                // Clear any old values and then append the new dynamic list options.          
                $messageFieldTo.empty().append(optionsHTML);
            });
        };

        /*
         * Sets up the timepicker drop down menus for the Event Time fields, 
         * based on the arrays for hour, minutes, and AM/PM as pre-defined earlier in the JS.  
         * Hours are 1-12, minutes are in 15 min intervals.       
         */
        var eventTimeInit = function(hrSelectedID, minSelectedID, AMPMSelectedID) {
            // Filling in the hours dropdown menu.
            var hoursOptionsHTML = createOptions(allHourOptions, hrSelectedID, true);
            $messageEventTimeHour.empty().append(hoursOptionsHTML);

            // Filling in minutes dropdown menu.                             
            var minuteOptionsHTML = createOptions(allMinuteOptions, minSelectedID, true);
            $messageEventTimeMinute.empty().append(minuteOptionsHTML);

            // Filling in AM/PM dropdown menu.
            var ampmOptionsHTML = createOptions(allAMPMOptions, AMPMSelectedID, true);
            $messageEventTimeAMPM.empty().append(ampmOptionsHTML);
        };


        //////////////////////////////////////////
        // Date picker initialization functions //
        //////////////////////////////////////////

        $messageFieldSendDate.datepicker({
            showOn: 'button',
            buttonImage: datePickerButtonImageUrl,
            buttonImageOnly: true,
            buttonText: 'Click to pick a date.',
            onSelect: function() {
                $messageFieldSendDate.removeClass(invalidClass);
                isDirty = true;
            } // Clearing validation errors
        });

        $messageTaskDueDate.datepicker({
            showOn: 'button',
            buttonImage: datePickerButtonImageUrl,
            buttonImageOnly: true,
            buttonText: 'Click to pick a date.',
            onSelect: function() {
                $messageTaskDueDate.removeClass(invalidClass);
                isDirty = true;
            } // Clearing validation errors
        });

        $messageEventDate.datepicker({
            showOn: 'button',
            buttonImage: datePickerButtonImageUrl,
            buttonImageOnly: true,
            buttonText: 'Click to pick a date.',
            onSelect: function() {
                $messageEventDate.removeClass(invalidClass);
                isDirty = true;
            } // Clearing validation errors
        });


        //////////////////////////////
        // BBQ navigation functions //
        //////////////////////////////

        // Return to drafts panel.
        var backToDrafts = function () {
            $.bbq.pushState({l: "notifications/drafts"}, 2);
        };

        // Return to queue panel.
        var backToQueue = function () {
            $.bbq.pushState({l: "notifications/queue"}, 2);
        };

        // Return to archive panel.
        var backToArchive = function () {
            $.bbq.pushState({l: "notifications/archive"}, 2);
        };

        // Return to trash panel.
        var backToTrash = function() {
            $.bbq.pushState({l: "notifications/trash"}, 2);
        };

        var switchToDynamicListsCreationWidget = function() {
            $.bbq.pushState({l: "dynlists"}, 2);
        };


        ////////////////////////////////////
        // Notification loading functions //
        ////////////////////////////////////

        var fillInTaskSpecificData = function () {
            $messageFieldType.val("task");
            notificationTypeInit("task");
            $messageRequiredYes.attr("checked", true); // tasks are always required
            $messageFieldSubject.val(currentMessage.calendarWrapper.icalData.SUMMARY);
            $messageFieldBody.val(currentMessage.calendarWrapper.icalData.DESCRIPTION);
            if (currentMessage.calendarWrapper.icalData.DUE != null) {
                var taskDate = sakai.api.Util.parseSakaiDate(currentMessage.calendarWrapper.icalData.DUE);
                $messageTaskDueDate.datepicker("setDate", taskDate);
            }
        };

        var messageHasSavedUXState = function() {
            if (currentMessage.uxState["eventMin"] != null) {
                return true;
            }
            else if (currentMessage.uxState["eventHour"] != null) {
                return true;
            }
            else if (currentMessage.uxState["eventAMPM"] != null) {
                return true;
            }
            return false;
        };

        var fillInEventSpecificData = function () {
            $messageFieldType.val("event");
            notificationTypeInit("event");

            if(currentMessage.calendarWrapper.isRequired) {
                $messageRequiredYes.attr("checked", true);
            } else {
                $messageRequiredNo.attr("checked", true);
            }

            $messageFieldSubject.val(currentMessage.calendarWrapper.icalData.SUMMARY);
            $messageFieldBody.val(currentMessage.calendarWrapper.icalData.DESCRIPTION);
            // If the event date was filled out properly, we can extract all the proper date and time information from it.
            if (currentMessage.calendarWrapper.icalData.DTSTART != null) {
                var eventDate = sakai.api.Util.parseSakaiDate(currentMessage.calendarWrapper.icalData.DTSTART);
                var hours = eventDate.getHours();
                var minutes = eventDate.getMinutes();
                var AMPM = "AM";
                $messageEventDate.datepicker("setDate", eventDate);
                if (hours > 11) {
                    if (hours !== 12) {
                        hours -= 12;
                    }
                    AMPM = "PM";
                }
                else
                if (hours === 0) {
                    hours += 12;
                }
                eventTimeInit(hours, minutes, AMPM);
            }
            // If it was not filled out properly but the time fields were still filled out by the user, we
            // still need to handle this case and put in the information properly.
            else if (messageHasSavedUXState()) {

                var hours = currentMessage.uxState["eventHour"];
                var minutes = currentMessage.uxState["eventMin"];
                var AMPM = currentMessage.uxState["eventAMPM"];

                eventTimeInit(hours, minutes, AMPM);
            }

            if(currentMessage.calendarWrapper.icalData.LOCATION != null) {
                $messageEventPlace.val(currentMessage.calendarWrapper.icalData.LOCATION);
            }
        };

        var fillInMessageSpecificData = function () {
            $messageFieldType.val("message");
            notificationTypeInit("message");
            $messageFieldSubject.val(currentMessage.subject);
            $messageFieldBody.val(currentMessage.body);
            $messageRequiredNo.attr("checked", "checked"); //messages are not required
        };

        /**
         * Fill in the notification detail page with the message's information.
         */
        var fillInMessage = function(callback) {

            // Fill out all the common fields.
            if (currentMessage["sendDate"] != null && currentMessage["sendDate"] !== "null") {
                var sendDate = sakai.api.Util.parseSakaiDate(currentMessage["sendDate"]);
                $messageFieldSendDate.datepicker("setDate", sendDate);
            }

            dynamicListInit(currentMessage["dynamicListID"]);

            // Chose notification type
            var type = currentMessage.type;
            if ( type === "calendar" ) {
                type = currentMessage.calendarWrapper.component;
            }

            switch(type) {
                case "VTODO":
                    fillInTaskSpecificData();
                    break;
                case "VEVENT":
                    fillInEventSpecificData();
                    break;
                case "message":
                    fillInMessageSpecificData();
                    break;
                default:
                    break;
            }

            if ($.isFunction(callback)) {
                callback(true);
            }
        };

        /**
         * This function is called when a notification has been successfully loaded
         * @param {String} calledFrom What message box we called this function from so we know what mode to put it in.
         */
        var onLoadNotification = function(calledFrom) {
            eventTimeInit(null, null, null);
            isDirty = false;

            hideAllButtonLists();

            switch(calledFrom) {
                case "drafts":

                    $widgetTitle.text(translate("WIDGET_TITLE_EDIT_NOTIFICATION"));

                    // Re-enable all buttons and textboxes in case they were disabled during viewing of Queue or Trash notifications
                    reenableView();

                    // Fill out the proper information.
                    fillInMessage(checkFieldsForErrors(false));

                    // Show the proper button list
                    $("#editdraft-buttons", $rootElement).show();
                    break;
                case "queue":

                    $widgetTitle.text(translate("WIDGET_TITLE_VIEW_NOTIFICATION"));

                    // Disable the form, disallowing the user to edit.
                    disableView();

                    // Now fill out the proper information.
                    fillInMessage(null);

                    // Display the proper buttons.
                    $("#queueview-buttons", $rootElement).show();
                    break;
                case "archive":

                    $widgetTitle.text(translate("WIDGET_TITLE_VIEW_NOTIFICATION"));

                    // Disable the form, disallowing the user to edit.
                    disableView();

                    // Now fill out the proper information.
                    fillInMessage(null);

                    // Display the proper buttons.
                    $("#archiveview-buttons", $rootElement).show();

                    break;
                case "trash":

                    $widgetTitle.text(translate("WIDGET_TITLE_VIEW_NOTIFICATION"));

                    // Now fill out the proper information.
                    fillInMessage(null);

                    // And disable the form, disallowing the user to edit.
                    disableView();

                    // Display the proper buttons.
                    $("#trashview-buttons", $rootElement).show();
                    break;
                default:
                    break;
            }

            $rootElement.show();
        };

        /**
         * Loads a notification by sending an AJAX request
         * @param {String} calledFrom What message box we called this function from so we know what mode to put it in.
         * @param {String} messageId Id of a message to load
         */
        var loadNotification = function(calledFrom, messageId) {

            currentMessageId = messageId;
            currentMessage = null;

            var url = "/~" + me.user.userid + "/_myberkeley_notificationstore/" + messageId + ".json";

            $.ajax({
                url: url,
                cache: false,
                async: true,
                success: function(data){
                    currentMessage = data;
                    currentMessage.calendarWrapper = $.parseJSON(data.calendarWrapper);
                    currentMessage.uxState = $.parseJSON(data.uxState);
                    onLoadNotification(calledFrom);
                },
                error: function(){
                    // $rootElement cannot be used in this selector because this message is out of root element's scope
                    showGeneralMessage(translate("THE_MESSAGE_COULD_NOT_BE_LOADED"), true);
                }
            });
        };



        //////////////////////////
        // Validation functions //
        //////////////////////////

        /**
         * This method will check if there are any required fields that are not filled in.
         * If a field is not filled in the invalidClass will be added to that field.
         * Returns a boolean that determines if the fields are valid or not.
         * @param {boolean} displayErrors Do we need to display errors or just do a check?
         * @return valid True = no errors, false = errors found.
         */
        var checkFieldsForErrors = function(displayErrors) {
            var valid = true;
            var today = new Date(); // full today's date
            var month = today.getMonth();
            var day = today.getDate();
            var year = today.getFullYear();
            var modtoday = new Date(year, month, day); // today's date with 00:00:00 time

            // Collect the values of each of the elements that require validation.
            var requiredYes = $messageRequiredYes.attr("checked");
            var requiredNo = $messageRequiredNo.attr("checked");
            var sendDate = $messageFieldSendDate.val();
            var sendTo = $messageFieldTo.val();
            var subject = $messageFieldSubject.val();
            var body = $messageFieldBody.val();
            var taskDueDate = $messageTaskDueDate.val();
            var eventDate = $messageEventDate.val();
            var eventTimeHour = $messageEventTimeHour.val();
            var eventTimeMinute = $messageEventTimeMinute.val();
            var eventTimeAMPM = $messageEventTimeAMPM.val();
            var eventPlace = $messageEventPlace.val();

            var sendDateObj = $($messageFieldSendDate).datepicker("getDate");
            var taskDueDateObj = $($messageTaskDueDate).datepicker("getDate");
            var eventDateObj = $($messageEventDate).datepicker("getDate");

            // Remove the invalidClass from each element first.
            if (displayErrors) clearInvalids();

            // Check for invalid values.
            if (!requiredYes && !requiredNo) {
                if (!displayErrors) return false;
                valid = false;
                $(".right", $messageFieldRequiredCheck).addClass(invalidClass);
            }
            if (!sendDate) {
                if (!displayErrors) return false;
                valid = false;
                $messageFieldSendDate.addClass(invalidClass);
            }
            else if (modtoday > sendDateObj) {
                if (!displayErrors) return false;
                valid = false;
                $messageFieldSendDate.addClass(invalidClass);
            }
            if (!sendTo) {
                if (!displayErrors) return false;
                valid = false;
                $messageFieldTo.addClass(invalidClass);
            }

            if (!subject) {
                if (!displayErrors) return false;
                valid = false;
                $messageFieldSubject.addClass(invalidClass);
            }
            if (!body) {
                if (!displayErrors) return false;
                valid = false;
                $messageFieldBody.addClass(invalidClass);
            }


            var type = $messageFieldType.val();

            switch(type) {
                case "task":
                    if (!taskDueDate) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageTaskDueDate.addClass(invalidClass);
                    }
                    else if (modtoday > taskDueDateObj) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageTaskDueDate.addClass(invalidClass);
                    }
                    else if (sendDateObj > taskDueDateObj) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageTaskDueDate.addClass(invalidClass);
                    }
                    break;

                case "event":
                    if (!eventDate) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventDate.addClass(invalidClass);
                    }
                    else if (modtoday > eventDateObj) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventDate.addClass(invalidClass);
                    }
                    else if (sendDateObj > eventDateObj) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventDate.addClass(invalidClass);
                    }
                    else {
                        // If the event date is today, check that the time hasn't already passed.
                        if ((eventDateObj.getTime() - modtoday.getTime()) === 0) {
                            if (eventTimeHour && eventTimeMinute && eventTimeAMPM) {
                                var compareToHour = parseInt(eventTimeHour);
                                var compareToMin = parseInt(eventTimeMinute);

                                // Convert to military time.
                                if (eventTimeAMPM == "PM") {
                                    if (compareToHour < 12) {
                                        compareToHour += 12;
                                    }
                                }

                                eventDateObj.setHours(compareToHour);
                                eventDateObj.setMinutes(compareToMin);

                                // If the event is today and the time of the event has already passed...
                                if (today.getTime() > eventDateObj.getTime()) {
                                    if (!displayErrors) return false;
                                    valid = false;
                                    $messageEventTimeHour.addClass(invalidClass);
                                    $messageEventTimeMinute.addClass(invalidClass);
                                    $messageEventTimeAMPM.addClass(invalidClass);
                                }
                            }
                        }
                    }
                    if (!eventTimeHour) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventTimeHour.addClass(invalidClass);
                    }
                    if (!eventTimeMinute) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventTimeMinute.addClass(invalidClass);
                    }
                    if (!eventTimeAMPM) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventTimeAMPM.addClass(invalidClass);
                    }
                    if (!eventPlace) {
                        if (!displayErrors) return false;
                        valid = false;
                        $messageEventPlace.addClass(invalidClass);
                    }

                    break;

                case "message":
                     //TODO: Add validation for messages

                default:

                    break;
            }

            // Displays an error message if displayErrors is true and valid is false.
            if (!valid && displayErrors) {
                showGeneralMessage(translate("PLEASE_CORRECT_INVALID_FIELDS"), true);
            }

            // Return the status of the form.
            return valid;
        };


        //////////////////////////////////
        // Save notifications functions //
        //////////////////////////////////

        /**
         * Loads task's data into appropriate fields of the POST object.
         * @param {Object} toPost Storage object
         */
        var initPostObjectWithTaskData = function(toPost) {
            toPost["type"] = "calendar";

            // Tasks are considered always required
            toPost.calendarWrapper.icalData.CATEGORIES = ["MyBerkeley-Required"];

            toPost.calendarWrapper.component = "VTODO";
            toPost.calendarWrapper.icalData.STATUS = "NEEDS-ACTION";
            if ($messageTaskDueDate.val() !== "") {
                toPost.calendarWrapper.icalData.DUE = formatISO8601($messageTaskDueDate.datepicker("getDate"));
                toPost.calendarWrapper.icalData.DTSTART = formatISO8601($messageTaskDueDate.datepicker("getDate"));
            }
        };

        /**
         * Loads event's data into appropriate fields of the POST object.
         * @param {Object} toPost Storage object
         */
        var initPostObjectWithEventData = function(toPost) {
            toPost["type"] = "calendar";
            if ($messageRequiredYes.attr("checked")) {
                toPost.calendarWrapper.icalData.CATEGORIES = ["MyBerkeley-Required"];
            } else {
                toPost.calendarWrapper.icalData.CATEGORIES = [];
            }

            toPost.calendarWrapper.component = "VEVENT";
            // If the event date is filled out, we handle this normally and save the time information there.
            var startDate = $messageEventDate.datepicker("getDate");
            if (startDate != null) {
                startDate.setMinutes($messageEventTimeMinute.val());
                // Get the event time details and add to the eventDate obj.
                if ($messageEventTimeAMPM.val() == "PM" && parseInt($messageEventTimeHour.val()) != 12) {
                    startDate.setHours(parseInt($messageEventTimeHour.val()) + 12);
                }
                else {
                    startDate.setHours($messageEventTimeHour.val());
                }
                toPost.calendarWrapper.icalData.DTSTART = formatISO8601(startDate);
            }
            // Otherwise, we need to check for and save the time information in case the user filled this out.
            else {
                toPost.uxState["eventMin"] = $messageEventTimeMinute.val();
                toPost.uxState["eventAMPM"] = $messageEventTimeAMPM.val();
                toPost.uxState["eventHour"] = $messageEventTimeHour.val();
            }
            toPost.calendarWrapper.icalData.LOCATION = $messageEventPlace.val();
        };

        /**
         * Loads message's data into appropriate fields of the POST object.
         * @param {Object} toPost Storage object
         */
        var initPostObjectWithMessageData = function(toPost) {
            toPost["type"] = "message";
            toPost["subject"] = $messageFieldSubject.val();
            toPost["body"] = $messageFieldBody.val();
            delete(toPost.calendarWrapper); // messages don't have calendar data
        };

        /**
         * Save the information currently on the notification detail page
         * into a ready-to-post message.
         * @param {Object} box The box to which we are going to save this message to.
         * @param {Object} isValidated Whether or not the message is validated via checkFieldsForErrors().
         * @return {Object} toPost The message we are going to post.
         */
        var saveData = function(box, isValidated) {
            // Filling out all common fields.
            var msgTo = $messageFieldTo.val() || "";

            var toPost = {
                "dynamicListID": msgTo,
                "senderID" : me.user.userid,
                "sendState": "pending",
                "sakai:messagebox": box,
                "uxState" : {
                    "validated" : isValidated
                },
                calendarWrapper : {
                    uri : null,
                    etag : formatISO8601(new Date()),
                    icalData : {
                        SUMMARY : $messageFieldSubject.val(),
                        DESCRIPTION : $messageFieldBody.val()
                    }
                }
            };

            // sendDate is handled a little differently, because it is called
            // by a sakai date parsing util which throws an error if not
            // the proper Date object type.
            var sendDate = $messageFieldSendDate.datepicker("getDate");
            if (sendDate === null) {
                toPost["sendDate"] = null;
            }
            else {
                toPost["sendDate"] = formatISO8601(sendDate);
            }


            var type = $messageFieldType.val();

            switch(type) {
                case "task":
                    initPostObjectWithTaskData(toPost);
                    break;

                case "event":
                    initPostObjectWithEventData(toPost);
                    break;

                case "message":
                    initPostObjectWithMessageData(toPost);
                    break;

                default:
                    break;
            }

            return toPost;
        };

        /**
         * Post the notification's data via an Ajax call, either to create a new
         * notification or to update an existing one. The only difference between the
         * two will be the URL to which we make the post, and we can determine which
         * case we are handling via whether or not the optional original parameter
         * is null (and therefore has a valid id) or not.
         * @param {Object} toPost Message to post; usually created via saveData() function.
         * @param {Object} successCallback (optional) Function to call if successful post; usually redirect function.
         * @param {String} original (optional) The original message, if this is an update.
         * @param {boolean} copyCheck (optional) Are we copying? If we are, we need to append "Copy to" to the subject.
         * @param {String} msgTxt String to be used in the popup message text indicating success or failure.
         */
        var postNotification = function (toPost, successCallback, original, copyCheck, msgTxt) {

            // don't save twice if user is rapidly double-clicking
            if (!saveEnabled) {
                return;
            }
            saveEnabled = false;
            $("#composenotification_box .s3d-button", $rootElement).addClass("disabled");

            var url = "/user/" + me.user.userid + "/.myb-notificationstore.html";

            // Are we creating a copy of an existing notification?
            if (copyCheck) {
                if ( toPost.type === "message") {
                    toPost.subject = translate("COPY_OF") + " " + toPost.subject;
                } else {
                    toPost.calendarWrapper.icalData.SUMMARY = translate("COPY_OF") + " " + toPost.calendarWrapper.icalData.SUMMARY;
                }

            }

            // Are we modifying an existing notification?
            if (original !== null) {
                toPost.id = original.id;

            }

            // Post all the data in an Ajax call.
            $.ajax({
                url: url,
                type: "POST",
                data: { notification : $.toJSON(toPost) },
                success: function() {
                    if (msgTxt != null) {
                        showGeneralMessage(msgTxt + " " + translate("SUCCESSFUL") + ".", false);
                    }
                    // If a callback function is specified in argument, call it.
                    if ($.isFunction(successCallback)) {
                        successCallback(true);
                    }
                },
                error: function(data) {
                    if (msgTxt != null) {
                        showGeneralMessage(msgTxt + " failed.", true);
                    }
                    else {
                        showGeneralMessage(translate("AN_ERROR_HAS_OCCURRED"), true);
                    }
                }
            });
        };


        ////////////////////
        // Event handlers //
        ////////////////////

        $createNewDynamicListButton.click(function() {
            if (isDirty) {
                $saveReminderDialog.jqmShow();
            }
            else {
                switchToDynamicListsCreationWidget();
            }
            return false;
        });

        // Notification type combo
        $messageFieldType.change(function() {
            var value = $(this).attr('value');
            notificationTypeInit(value);
            isDirty = true;
        });

        // Copying message to drafts...
        $("#cn-archivecopytodrafts-button", $rootElement).click(function() {
            postNotification(saveData("drafts", true), backToArchive, null, true, translate("COPY"));
        });

        // Event handler for when user clicks on DLC "Save" button.
        $("#dlc-save", $rootElement).click(function() {
            // Check that the subject field isn't empty before saving
            if ($messageFieldSubject.val() === "") {
                // If subject field is empty, cancel jqm dialog and highlight subject field.
                $saveReminderDialog.jqmHide();
                $messageFieldSubject.addClass(invalidClass);
            } else {
                // Save the draft.
                postNotification(saveData("drafts", checkFieldsForErrors(false)), switchToDynamicListsCreationWidget, currentMessage, null, null);
            }
        });

        // Event handler for when you click on the "Don't Save" button on DLC dialog.
        $("#dlc-dontsave", $rootElement).click(function() {
            // Hide jqm dialog before moving, so that clicking Back button on browser doesn't take you
            // back to this page with the dialog box still open
            $saveReminderDialog.jqmHide();
            switchToDynamicListsCreationWidget();
        });

        // Queueing this draft...
        $("#cn-queuedraft-button", $rootElement).click(function() {
            if (checkFieldsForErrors(true)) {
                postNotification(saveData("queue", true), backToDrafts, currentMessage, null, translate("QUEUE"));
            }
        });

        // Updating and re-saving this draft...
        $("#cn-updatedraft-button", $rootElement).click(function() {
            postNotification(saveData("drafts", checkFieldsForErrors(false)), backToDrafts, currentMessage, null, translate("SAVE"));
        });

        // Deleting the draft...
        $("#cn-deletedraft-button", $rootElement).click(function() {
            postNotification(saveData("trash", false), backToDrafts, currentMessage, null, translate("DELETE"));
        });

        // When someone clicks on the 'Queue' button from base panel.
        $("#cn-queue-button", $rootElement).click(function() {
            if (checkFieldsForErrors(true)) {
                postNotification(saveData("queue", true), backToDrafts, null, null, translate("QUEUE"));
            }
        });

        // When someone clicks on the 'Save as Draft' button from base panel.
        $("#cn-saveasdraft-button", $rootElement).click(function() {
            if ($messageFieldSubject.val() === "") {
                $messageFieldSubject.addClass(invalidClass);
            } else {
                postNotification(saveData("drafts", checkFieldsForErrors(false)), backToDrafts, null, null, translate("SAVE"));
            }
        });

        $("#cn-cancel-button,#cn-editdraft-cancel-button,#cn-queueview-cancel-button,#cn-archiveview-cancel-button,#cn-trashview-cancel-button", $rootElement).click(function() {
            $.bbq.removeState(['new', 'edit']);
            //return false;
        });

        // Moving message from queue to drafts...
        $("#cn-movetodrafts-button", $rootElement).click(function() {
            postNotification(saveData("drafts", true), backToQueue, currentMessage, null, translate("MOVE"));
        });

        // Copying message to drafts...
        $("#cn-queuecopytodrafts-button", $rootElement).click(function() {
            postNotification(saveData("drafts", true), backToQueue, null, true, translate("COPY"));
        });

        // Deleting message...
        $("#cn-deletequeued-button", $rootElement).click(function() {
            postNotification(saveData("trash", false), backToQueue, currentMessage, null, translate("DELETE"));
        });

        // Enable editing of message (move it to drafts and re-initialise widget).
        $("#cn-editrashed-button", $rootElement).click(function() {
            postNotification(saveData("drafts", checkFieldsForErrors(false)), loadNotification("drafts", currentMessageId), currentMessage, false, null);
        });

        // Hard delete this message (delete it from the trash).
        $("#cn-deletetrashed-button", $rootElement).click(function() {
            var requests = [];
            var msgUrl = "/~" + me.user.userid + "/_myberkeley_notificationstore/" + currentMessageId;

            var toDelete = {
                "url": msgUrl,
                "method": "POST",
                "parameters": {
                    ":operation": "delete"
                }
            };
            requests.push(toDelete);
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                success: function() {
                    showGeneralMessage(translate("DELETE_SUCCESSFUL"), false);
                    backToTrash();
                },
                error: function() {
                    showGeneralMessage(translate("DELETE_FAILED"), true);
                }
            });
        });



        ///////////////////////////////
        // Validation event handlers //
        ///////////////////////////////

        $messageRequiredNo.change(function() {
            // Clearing validation errors
            $("#composenotification_required .right", $rootElement).removeClass(invalidClass);
            isDirty = true;
        });

        $messageRequiredYes.change(function() {
            // Clearing validation errors
            $("#composenotification_required .right", $rootElement).removeClass(invalidClass);
            isDirty = true;
        });

        $messageFieldSendDate.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });
        $messageFieldSendDate.keypress(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageTaskDueDate.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });
        $messageTaskDueDate.keypress(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventDate.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventDate.keypress(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageFieldSubject.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageFieldSubject.keypress(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageFieldBody.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageFieldBody.keypress(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventPlace.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventPlace.keypress(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageFieldTo.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventTimeHour.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventTimeMinute.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });

        $messageEventTimeAMPM.change(function() {
            // Clearing validation errors
            $(this).removeClass(invalidClass);
            isDirty = true;
        });



        ////////////////////////////////
        // Hashchange events handling //
        ////////////////////////////////

        /**
         * Sets current state of this component (list mode or edit mode).
         * This function is called when hashchange event fires.
         */
         var setState = function(){

            var state = $.bbq.getState();

            if (!(state.hasOwnProperty("l") && state.l.indexOf("notifications/") === 0)) {
                return;
            }

            if(state.hasOwnProperty("new")) {
                resetForm();
                dynamicListInit(null);
                $widgetTitle.text(translate("WIDGET_TITLE_CREATE_NOTIFICATION"));
                $("#createnew-buttons", $rootElement).show();
                $rootElement.show();
            } else if(state.hasOwnProperty("edit")) {

                resetForm();

                var box, msgId;

                if(state.hasOwnProperty("l")) {
                    box = state.l;
                }

                if(state.hasOwnProperty("edit")) {
                    msgId = state.edit;
                }

                switch(box) {
                    case "notifications/drafts":
                        loadNotification("drafts", msgId);
                        break;
                    case "notifications/queue":
                        loadNotification("queue", msgId);
                        break;
                    case "notifications/archive":
                        loadNotification("archive", msgId);
                        break;
                    case "notifications/trash":
                        loadNotification("trash", msgId);
                        break;
                    default:
                        break;
                }



            } else {
                $rootElement.hide();
            }
        };

        $(window).bind('hashchange', function() {
            setState();
        });



        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function() {
            var security = sakai.api.Security;

            // if the user is not a member of the advisers group then bail
            if (!myb.api.security.isUserAnAdviser()) {
                security.send403();
                return;
            }

            setState();

            // HACK: To prevent flickering this widget was made invisible in HTML code, need to undo this
            $("div.composenotification_widget", $rootElement).show();

        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("composenotification");

});