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

/* global $, Config, opensocial */

define(["jquery","sakai/sakai.api.core"], function($, sakai) {

    var noticeWidgets = {};

    noticeWidgets.DATE_FORMAT_ISO8601 = "yyyyMMddTHHmmssZ";
    noticeWidgets.ONE_DAY = 24 * 60 * 60 * 1000;
    noticeWidgets.BEGINNING_OF_TIME = sakai.api.Util.Datetime.toGMT(new Date(2000, 0, 1, 0, 0, 0, 0));
    noticeWidgets.END_OF_TIME = sakai.api.Util.Datetime.toGMT(new Date(3000, 0, 1, 0, 0, 0, 0));

    noticeWidgets.utils = {};

    /**
     * Formats a date to "mm/dd" format
     * @param {Object} date UTF string
     */
    noticeWidgets.utils.formatDate = function(date, format) {
        if (!date) return null;
        date = sakai.api.Util.parseSakaiDate(date);
        return Globalization.format(date, format);
    };

    /**
     * Generic constructor for noticewidgets (of which tasks is one type, and events is another).
     * @param config
     */
    noticeWidgets.Widget = function(config) {
        var that = function() {
        };
        var model = {
            data : null,
            archiveMode : false,
            detailMode : false,
            currentNotice : 0,
            filterSettings : {
                sortOn : config.defaultSortOn,
                sortOrder : "ASC",
                dateRange : config.getDateRange(),
                itemStatus : config.getItemStatus()
            }
        };

        var filterContainer = $(".noticewidget_filter_container", config.rootContainer);
        var filterControl = $(".noticewidget_filter_control", config.rootContainer);
        var filterControlContainer = $(".noticewidget_filter", config.rootContainer);
        var filterControlIndicator = $(".noticewidget_filter_control_indicator", config.rootContainer);
        var filterControlHeader = $(".noticewidget_filter_control_header", config.rootContainer);
        var loadingIndicator = $(".noticewidget_listing_loading", config.rootContainer);
        var listingTable = $("table.noticewidget_listing", config.rootContainer);


        // This function is used to notify mytasks.js and myevents.js about model changes
        var onModelChange = function(model) {
            if ($.isFunction(config.onModelChange)) {
                config.onModelChange(model);
            }
        };

        that.init = function() {
            setupListeners();
        };

        that.start = function(callback) {
            sakai.api.Server.loadJSON(config.filterSettingsURL, function (success, data) {
                if (success) {
                    // user has saved filter prefs, use 'em
                    model.filterSettings = data;
                    if ( model.filterSettings.sortOn.indexOf("sakai:") > -1 ) {
                        // obsolete filter critiera; revert to default
                        model.filterSettings.sortOn = config.defaultSortOn;
                        model.filterSettings.sortOrder = "ASC";
                    }
                    updateFilterControls();
                    that.getNotices(callback);
                } else {
                    // user has no stored filter settings, so save the default ones
                    that.saveFilterSettingsAndGetNotices(function() {
                        that.getNotices(callback);
                    });
                }
            });
        };

        that.saveFilterSettingsAndGetNotices = function(callback) {
            model.filterSettings.dateRange = config.getDateRange();
            model.filterSettings.itemStatus = config.getItemStatus();
            sakai.api.Server.saveJSON(config.filterSettingsURL, model.filterSettings, function() {
                updateFilterControls();
                that.getNotices(callback);
            });
        };

        that.getNotices = function(callback) {
            /**
             * uses OEA applyThreeDots function to force the width of the object used for truncation
             */
            var subjectLines = function() {
                var subjectCells = $("td.subjectLine", config.rootContainer);
                var theWidth = $("th.subjectLine", config.rootContainer).innerWidth() - 10;
                var currCell = {};
                $(subjectCells).each(function () {
                    currCell = $(this);
                    currCell.text(sakai.api.Util.applyThreeDots(currCell.text(), theWidth, {max_rows: 1,whole_word: false}));
                });
            };

            var dataURL = config.dataURL;

            var url = dataURL + "&sort=" + model.filterSettings.sortOn + "_" + model.filterSettings.sortOrder
                    + config.buildExtraQueryParams(model.archiveMode);
            loadingIndicator.show();
            listingTable.hide();

            $.ajax({
                url: url,
                cache: false,
                success: function(data) {
                    loadingIndicator.hide();
                    listingTable.show();
                    if (data.results) {
                        model.data = data;
                        model.currentNotice = 0;
                        config.container.html(sakai.api.Util.TemplateRenderer(config.template, {
                            results : model.data.results,
                            noticeWidgetUtils : noticeWidgets.utils,
                            sakaiUtil : sakai.api.Util
                        }));
                        that.updateUI();
                        subjectLines();
                        if ($.isFunction(callback)) {
                            callback();
                        }
                        // Notify the subscriber about model change
                        onModelChange(model);
                    } else {
                        announceError();
                        window.debug.error("There are no results in the returned data. Data dump:", data);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    announceError();
                }
            });

        };

        var setupListeners = function() {

            var filters = function() {
                filterControlHeader.live("click", function() {
                    if (filterControlContainer.is(":visible")) {
                        filterControlContainer.hide();
                        filterControlIndicator.removeClass("open");
                        filterControlIndicator.addClass("closed");
                    } else {
                        filterControlContainer.show();
                        filterControlIndicator.removeClass("closed");
                        filterControlIndicator.addClass("open");
                    }
                });

                $("input:radio", config.rootContainer).live("click", function() {
                    that.saveFilterSettingsAndGetNotices();
                });
            };

            var sortControls = function() {
                $(".noticewidget_listing_sort", config.rootContainer).live("click", function() {
                    var newSortCol = $(this);
                    var oldSortOn = model.filterSettings.sortOn;
                    model.filterSettings.sortOn = newSortCol.get()[0].id.replace(/\w+_sortOn_/gi, "");
                    if (oldSortOn != model.filterSettings.sortOn) {
                        model.filterSettings.sortOrder = "ASC";
                    } else {
                        model.filterSettings.sortOrder = model.filterSettings.sortOrder === "ASC" ? "DESC" : "ASC";
                    }
                    that.saveFilterSettingsAndGetNotices();
                });
            };

            var detailControls = function() {
                $(".noticewidget_listing td.detailTrigger", config.rootContainer).live("click", function() {
                    model.currentNotice = this.id.replace(/\w+_/gi, "");
                    model.detailMode = true;
                    that.updateUI();
                });
                $(".return_to_list_container", config.rootContainer).live("click", function() {
                    model.detailMode = false;
                    that.updateUI();
                });
                $(".notice-next", config.rootContainer).live("click", function() {
                    if (model.currentNotice < model.data.results.length - 1) {
                        model.currentNotice++;
                        that.updateUI();
                    }
                });
                $(".notice-prev", config.rootContainer).live("click", function() {
                    if (model.currentNotice > 0) {
                        model.currentNotice--;
                        that.updateUI();
                    }
                });
            };

            var completedCheckboxes = function() {
                $(".task-completed-checkbox", config.rootContainer).live("click", function() {
                    var rowIndex = this.id.replace(/\w+_/gi, "");
                    var rowData = model.data.results[rowIndex];
                    rowData.isCompleted = !rowData.isCompleted;

                    postNotice(
                            config.dataURL,
                            { calendars : $.toJSON([
                                {
                                    uri : rowData.uri,
                                    isCompleted : rowData.isCompleted,
                                    isArchived : rowData.isArchived}
                            ])},
                            function() {
                                that.getNotices();
                            }
                            );
                });
            };

            var archiveControls = function() {
                $(".noticewidget_view_task_archive", config.rootContainer).live("click", function() {
                    model.archiveMode = !model.archiveMode;
                    model.detailMode = false;
                    // The code below is called before Ajax request
                    if (model.archiveMode) {
                        filterContainer.hide();

                        $(config.rootContainer).removeClass("mytasks_overdue_tasks_exist");
                        $(".mytasks_overdue_tasks_msg", config.rootContainer).hide();

                        // Change table caption
                        $("." + config.widgetName + "_listing caption").text(translate("ARCHIVE_CAPTION"));
                        $("." + config.widgetName + "_listing").addClass("archiveView");
                    } else {

                        // Hide Archive mode message
                        $(".showing_archive_msg", config.rootContainer).hide();

                        // Change table caption
                        $("." + config.widgetName + "_listing caption").text(translate("LIST_CAPTION"));
                        $("." + config.widgetName + "_listing").removeClass("archiveView");
                    }

                    that.getNotices(function() {
                        // The code below is called after data has been received
                        if (model.archiveMode) {
                            // Display Archive mode message
                            $(".showing_archive_msg", config.rootContainer).show();

                        } else {
                            filterContainer.show();
                        }
                    });
                });
                $(".noticewidget_archive_tasks_button", config.rootContainer).live("click", function() {
                    if ($(this).is(":disabled")) {
                        // don't attempt to archive a task whose archive button is disabled
                        return;
                    }
                    if (model.detailMode) {
                        model.detailMode = false;
                        var rowData = model.data.results[model.currentNotice];
                        rowData.isArchived = !rowData.isArchived;

                        postNotice(config.dataURL,
                                { calendars : $.toJSON([
                                    {
                                        uri : rowData.uri,
                                        isCompleted : rowData.isCompleted,
                                        isArchived : rowData.isArchived
                                    }
                                ]) },
                                function() {
                                    that.getNotices();
                                }
                                );
                        return;
                    }

                    var calendars = [];
                    if (model.archiveMode) {
                        $.each(model.data.results, function(index, rowData) {
                            var selectionBox = $("#mytaskstdselect_" + index + " input");
                            if (selectionBox.get()[0].checked) {
                                rowData.isArchived = false;
                                calendars[calendars.length] = {
                                    uri : rowData.uri,
                                    isCompleted : rowData.isCompleted,
                                    isArchived : rowData.isArchived
                                };
                            }
                        });
                    } else {
                        $.each(model.data.results, function(index, rowData) {
                            if (rowData.isCompleted) {
                                rowData.isArchived = true;
                                calendars[calendars.length] = {
                                    uri : rowData.uri,
                                    isCompleted : rowData.isCompleted,
                                    isArchived : rowData.isArchived
                                };
                            }
                        });
                    }

                    postNotice(config.dataURL, {
                        calendars: $.toJSON(calendars)
                    }, that.getNotices);

                });
            };

            filters();
            sortControls();
            detailControls();
            completedCheckboxes();
            archiveControls();

        };

        that.updateUI = function() {

            var archiveControls = function() {
                var archiveTasksButtonText = $(".noticewidget_archive_tasks_button span", config.rootContainer);
                var viewArchiveButton = $(".noticewidget_view_task_archive", config.rootContainer);
                var noTasksMessage = $(".empty_list td:first", config.rootContainer);
                var selectorCells = $(".noticewidget_task_selector", config.rootContainer);

                if (model.archiveMode) {
                    archiveTasksButtonText.html(translate("MOVE_SELECTED_BACK_TO_LIST"));
                    viewArchiveButton.html(translate(config.buttonMessages.viewArchiveButton.archiveMode));
                    noTasksMessage.html(translate(config.buttonMessages.noItemsMessage.archiveMode));
                    selectorCells.show();
                } else {
                    archiveTasksButtonText.html(translate("ARCHIVE_COMPLETED_TASKS"));
                    viewArchiveButton.html(translate(config.buttonMessages.viewArchiveButton.listMode));
                    noTasksMessage.html(translate(config.buttonMessages.noItemsMessage.listMode));
                    selectorCells.hide();
                }
                var enabled = model.data.results.length > 0;
                if (model.detailMode) {
                    if (model.archiveMode) {
                        archiveTasksButtonText.html(translate("MOVE_THIS_TASK_BACK_TO_LIST"));
                    } else {
                        archiveTasksButtonText.html(translate("ARCHIVE_THIS_TASK"));
                    }

                    if (model.data.results[model.currentNotice]) {
                        var isCurrentTaskRequired = model.data.results[model.currentNotice]["sakai:required"];
                        if (isCurrentTaskRequired) {
                            enabled = model.data.results[model.currentNotice]["sakai:taskState"] === "completed";
                        } else {
                            enabled = true;
                        }
                    }
                }
                var parent = archiveTasksButtonText.parent();
                if (enabled) {
                    parent.removeAttr("disabled");
                } else {
                    parent.attr("disabled", true);
                }
            };

            var scroller = function() {
                var tbody = $("table.noticewidget_listing", config.rootContainer);
                tbody.toggleClass("scroller", (tbody.height() > 180));
            };

            var filterStatus = function() {
                $(".noticewidget_filter_header", config.rootContainer).html(translate("FILTER"));
                $(".noticewidget_filter_message", config.rootContainer).html(" " + translate(config.convertFilterStateToMessage()));
            };

            var showCurrentDetail = function() {
                $(".noticewidget_detail", config.rootContainer).html(sakai.api.Util.TemplateRenderer(config.detailTemplate,
                {
                    detail : model.data.results[model.currentNotice],
                    index : model.currentNotice,
                    noticeWidgetUtils : noticeWidgets.utils,
                    archiveMode: model.archiveMode
                }));
                if (model.currentNotice < model.data.results.length - 1) {
                    $(".notice-next", config.rootContainer).removeClass("disabled");
                } else {
                    $(".notice-next", config.rootContainer).addClass("disabled");
                }
                if (model.currentNotice > 0) {
                    $(".notice-prev", config.rootContainer).removeClass("disabled");
                } else {
                    $(".notice-prev", config.rootContainer).addClass("disabled");
                }
            };

            var detailMode = function() {
                var detailViewContainer = $(".noticewidget_detail_view", config.rootContainer);
                var listViewContainer = $(".noticewidget_list_view", config.rootContainer);
                if (model.detailMode) {
                    showCurrentDetail();
                    listViewContainer.hide();

                    var returnLinkMsg;
                    if (model.archiveMode) {
                        if (config.widgetName == "mytasks") {
                            returnLinkMsg = translate("RETURN_TO_ARCHIVED_TASK_LIST");
                        } else {
                            returnLinkMsg = translate("RETURN_TO_PAST_EVENT_LIST");
                        }
                    } else {
                        if (config.widgetName == "mytasks") {
                            returnLinkMsg = translate("RETURN_TO_TASK_LIST");
                        } else {
                            returnLinkMsg = translate("RETURN_TO_EVENT_LIST");
                        }
                    }

                    $("span.noticewidget_detail_return_link_msg", config.rootContainer).html(" " + returnLinkMsg);

                    detailViewContainer.show();
                } else {
                    listViewContainer.show();
                    detailViewContainer.hide();
                }
            };

            detailMode();
            archiveControls();
            scroller();
            filterStatus();
        };

        var updateFilterControls = function() {
            // move the sort arrow to the current sort column
            var currentSortCol = $("#" + config.widgetName + "_sortOn_" + model.filterSettings.sortOn.replace(/:/gi, "\\:"), config.rootContainer);

            // remove sort arrows from all table header columns
            $(".noticewidget_listing." + config.widgetName + "_listing thead th", config.rootContainer).each(function() {
                $(this).removeClass("ASC").removeClass("DESC");
            });

            // add sort arrow to the current column
            currentSortCol.addClass(model.filterSettings.sortOrder);

            // update the radio buttons
            var dateRangeRadio = $("#" + config.widgetName + "_date_range_" + model.filterSettings.dateRange);
            var itemStatusRadio = $("#" + config.widgetName + "_item_status_" + model.filterSettings.itemStatus);
            dateRangeRadio[0].checked = true;
            itemStatusRadio[0].checked = true;
        };

        var postNotice = function (url, props, callback) {
            $.ajax({
                type: 'POST',
                url: url,
                data: props,
                success: function() {
                    if ($.isFunction(callback)) {
                        callback();
                    }
                    // Notify the subscriber about model change
                    onModelChange(model);
                },
                error: function(xhr, textStatus, thrownError) {
                    announceError();
                },
                dataType: 'json'
            });
        };

        var translate = function(key) {
            return sakai.api.i18n.Widgets.getValueForKey(config.widgetName, "default", key);
        };

        var announceError = function() {
            sakai.api.Util.notification.show("", translate("AN_ERROR_OCCURRED_CONTACTING_THE_SERVER"),
                    sakai.api.Util.notification.type.ERROR, false);
        };

        return that;
    };

    return noticeWidgets;
});