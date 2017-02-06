var _isLoaded,
    _isRequesting,
    _unreadOnly,
    _unreadOnly2,
    _unreadFlag = false;

var _totalRead,
    _unRead,
    _totalRead2,
    _unRead2,
    _totalRead3,
    _unRead3,
    mouseY,
    startMouseY,
    _pageY = 0;

// To make the page navigation faster
$(document).on("mobileinit", function () {
    console.log("mobileinit")
    $.mobile.pageContainer = $('#main-warpper');
    $.mobile.defaultPageTransition = 'slide';
});
$(document).on("pageinit", "#mainPage", function () {
    // Swipe right to remove list item
    $("#main-warpper").on("swipeleft", function () {
        $('body').removeClass('sidebar-open');
    });
    // **** Handling DropDown Menu Open / Close
    //$('#drpdownToggle').on('click', function (event) {
    //    console.log('drpdownToggle Click!')
    //    $('#drpDownMenu').addClass('open');
    //});
    //$('body').on('click', function (e) {
    //    if (!$('#drpdownToggle').is(e.target)
    //        && $('#drpDownMenu').has(e.target).length === 0
    //        && $('.open').has(e.target).length === 0
    //    ) {
    //        $('#drpDownMenu').removeClass('open');
    //    }
    //});
    // *****
    getAllPlainSubject().done(function () {
        setTotalStatus().done(function () {
            getAllDailyNewsDate().done(function () {
                getAllDailyNews(false, 0, false).complete(function () {
                    $('#msg-total').text(_unRead);
                    $('#msgtotal').text(_totalRead);
                    $('#msg-unread').text(_unRead);
                });
            })
        });
    });
});
$(document).on("pageinit", "#noiPage", function () {
    window.localStorage.setItem('_offset2', 0);
    _isLoaded = false;
    getAllPlainNews(false)
});
$(document).on("pageinit", "#newsInsight", function () {
    _isLoaded = false;
    getAllTaggedNews(false)
});
$(document).on("pageshow", "#mainPage", function () {
    // control sidebar active class
    $('#sidebarMenu').children('li').removeClass('active');
    $($('#sidebarMenu').children('li')[0]).addClass('active');

    if (!_isLoaded) {
        loadingStatus(true);
    } else {
        loadingStatus(false);
    }
    $('#header-title').text('Daily update');
    $('#allSubjects').addClass('hidden');
    $('#allDates').removeClass('hidden');
    $('#msg-total').text(_unRead);
    $('#msg-unread').text(_unRead);
    if (_unreadFlag) {
        setTotalStatus().done(function () {
            $('#msg-total').text(_unRead);
            $('#msg-unread').text(_unRead);
            _unreadFlag = false;
        });
    }
});
$(document).on("pageshow", "#commentPage", function () {
    // TODO: control loading data
    if (_isRequesting) {
        loadingStatus(true);
    } else
        loadingStatus(false);
    $('#header-title').text('Comments');
});
$(document).on("pageshow", "#noiPage", function () {
    // control sidebar active class
    $('#sidebarMenu').children('li').removeClass('active');
    $($('#sidebarMenu').children('li')[1]).addClass('active');

    $('#header-title').text('Selected news');
    if (!_isLoaded) {
        loadingStatus(true);
    } else {
        loadingStatus(false);
    }
    $('#allSubjects').removeClass('hidden');
    $('#allDates').addClass('hidden');
    $('#msg-total').text(_unRead2);
    $('#msg-unread').text(_unRead2);
    if (_unreadFlag) {
        setTotalStatus().done(function () {
            $('#msg-total').text(_unRead2);
            $('#msg-unread').text(_unRead2);
            _unreadFlag = false;
        });
    }
});
$(document).on("pageshow", "#newsInsight", function () {
    // control sidebar active class
    $('#sidebarMenu').children('li').removeClass('active');
    $($('#sidebarMenu').children('li')[2]).addClass('active');

    $('#header-title').text('News insight');
    if (!_isLoaded) {
        loadingStatus(true);
    } else {
        loadingStatus(false);
    }
    $('#allSubjects').addClass('hidden');
    $('#allDates').addClass('hidden');

    $('#msg-total').text(_unRead3);
    $('#msg-unread').text(_unRead3);
    if (_unreadFlag) {
        setTotalStatus().done(function () {
            $('#msg-total').text(_unRead3);
            $('#msg-unread').text(_unRead3);
            _unreadFlag = false;
        });
    }
});
// ********* Body pull down to refresh **********
$('body').on('touchstart', function (ev) {
    if (_pageY == 0 && $(window).scrollTop() == 0 && !_isRequesting) {
        mouseY = ev.originalEvent.touches[0].pageY;
        startMouseY = mouseY;
        $(document).on('touchmove', function (e) {
            if (e.originalEvent.touches[0].pageY > mouseY) {
                _pageY = e.originalEvent.touches[0].pageY - startMouseY;
                if (_pageY < 140)
                    $('#spinnerDiv').css('padding-top', _pageY);
            }
        });
    }
});
$('body').on('touchend', function () {
    if (_pageY >= 145 && $(window).scrollTop() == 0 && !_isRequesting) {
        setTotalStatus();
        $('#spinnerDiv').css({ 'padding-top': 0, 'height': 0 });
        if ($('#header-title').text() == 'Daily update') {
            getAllDailyNews(false, 0, _unreadOnly);
            $('#allDates').val(0)
        }
        else if ($('#header-title').text() == 'Selected news') {
            getAllPlainNews(false);
            $('#allSubjects').val(0)
        }
        else if ($('#header-title').text() == 'News insight') {
            getAllTaggedNews(false);
            $('#allSubjects').val(0)
        }
    } else
        $('#spinnerDiv').css({ 'padding-top': 0 }); //, 'height': 0
    // reset the pageY
    _pageY = 0;
    $(document).unbind('touchmove');
});

function closeMenu() {
    $('.sidebar-toggle').click();
}
function getAllPlainSubject() {
    return $.post("http://actionnews.1touch.my/mobile/api/getAllPlainSubject", JSON.parse(window.localStorage.getItem("user")))
        .success(
        function (data) {
            if (data != null) {
                $.each(data.results, function (d, v) {
                    var option = $('<option>').val(v.id).text(v.title + ' (' + v.subjectCount + ')');
                    $('#allSubjects').append(option);
                });
            }
        })
    .done(function (d) { });
}
function getAllDailyNewsDate() {
    return $.post("http://actionnews.1touch.my/mobile/api/getAllDailyNewsDate", JSON.parse(window.localStorage.getItem("user")))
        .success(
        function (data) {
            if (data != null) {
                $.each(data.results, function (d, v) {
                    var option = $('<option>').val(v.date).text(v.date + ' (' + v.count + ')');
                    $('#allDates').append(option);
                });
            }
        })
    .done(function (d) { });
}
function getAllDailyNews(option, idx, unread) {
    loadingStatus(true);
    _isRequesting = true;
    if ($('body').hasClass('sidebar-open'))
        closeMenu();
    if (idx == 0)
        window.localStorage.setItem('_offset', 0);
    _offset = parseInt(window.localStorage.getItem("_offset"));

    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    data['offset'] = _offset;
    if (option)
        data['subject'] = $('#allSubjects').val();
    $('#mainPage').empty();    
    return $.post("http://actionnews.1touch.my/mobile/api/getAllDailyNews", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead = data.results.length;
                $.each(data.results, function (d, v) {
                    var element;
                    if (v.dailyNews != null) {
                        element = '<div id=' + v.dailyNews.id + ' class="box box-widget">'
                            + '<div class="box-header with-border">'
                            + '    <div class="user-block" style="margin-bottom: -.35em;">'
                                 + '   <div class="username"><strong>' + v.dailyNews.title + '</strong></div>'
                                  //+ ' <span class="badge bg-tags badge-simple"><small>' + v.sources.name + '</small></span>'
                                 + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.dailyNews.created_at).fromNow() + '</small></span>'
                                + '</div>'
                                + '<div class="box-tools">'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                        + '<i class="fa fa-minus fa-2x"></i>'
                                    + '</button>'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                                + '</div>'
                            + '</div>'
                            + '<div class="box-body" style="margin-top: -8px;">'
                                + '<p id="para-' + v.dailyNews.id + '" class="font-justified">'
                                    + v.dailyNews.content
                                + '</p>'
                           + '</div>';
                    } else {
                        var hidden, tendancy, style = "";
                        if (v.tendancy == 1) {
                            style = 'background-color: #008822;color: #fff;';
                            tendancy = 'Pro Government';
                        } else {
                            style = 'background-color: #c10000;color: #fff;';
                            tendancy = 'Pro Oposition';
                        }

                        if (v.read == false) {
                            hidden = "hidden";
                        } else {
                            hidden = "";
                        }
                        var source = v.sources != null ? v.sources.name : '';
                        element = '<div id=' + v.id + ' class="box box-widget">'
                            + '<div class="box-header with-border">'
                            + '    <div class="user-block" style="margin-bottom: -.35em;">'
                                 + '   <div class="username"><strong>' + v.title + '</strong></div>'
                                  + '  <span class="badge bg-tags" style="padding:2px 7px 3px;margin:0.5em 0 0.15em 0.15em; ' + style + '">'
                                  + '  <small><a href="#" tendancy_id=' + tendancy + ' style="color: inherit;">' + tendancy + '</a></small></span>'
                                  //+ ' <span class="badge bg-tags badge-simple"><small>' + v.sources.name + '</small></span>'
                                 + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.created_at).fromNow() + '</small></span>'
                                + '</div>'
                                + '<div class="box-tools">'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                        + '<i class="fa fa-minus fa-2x"></i>'
                                    + '</button>'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                                + '</div>'
                            + '</div>'
                            + '<div class="box-body" style="margin-top: -8px;">'
                                + ' <span class="badge bg-tags badge-simple" style="margin:-6px;margin-top: -10px;"><small>' + source + '</small></span>'
                                + '<p id="para-' + v.id + '" class="font-justified">'
                                    + v.content
                                + '</p>'
                                + "<p class='read-more' style='margin-top: -8px'><a href='#singleNews' onclick='getSingleDailyNews(" + v.id + ")'>Show more</a></p>"
                                + '<span id="checked-' + v.id + '" class=" ' + hidden + ' pull-right"><i style="color:#01791c;" class="fa fa-check-square-o"></i></span>'
                           + '</div>';
                    }
                    $('#mainPage').append(element);
                });
                _isLoaded = true;
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () {
            _isRequesting = false;
            loadingStatus(false)
        });
}
function getAllDailyNewsByDate(date) {
    loadingStatus(true);
    _isRequesting = true;
    if ($('body').hasClass('sidebar-open'))
        closeMenu();
    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    if (date)
        data['date'] = $('#allDates').val();
    $('#mainPage').empty();
    return $.post("http://actionnews.1touch.my/mobile/api/getAllDailyNewsByDate", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead = data.results.length;
                $.each(data.results, function (d, v) {
                    var element;
                    if (v.dailyNews != null) {
                        element = '<div id=' + v.dailyNews.id + ' class="box box-widget">'
                            + '<div class="box-header with-border">'
                            + '    <div class="user-block" style="margin-bottom: -.35em;">'
                                 + '   <div class="username"><strong>' + v.dailyNews.title + '</strong></div>'
                                  //+ ' <span class="badge bg-tags badge-simple"><small>' + v.sources.name + '</small></span>'
                                 + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.dailyNews.created_at).fromNow() + '</small></span>'
                                + '</div>'
                                + '<div class="box-tools">'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                        + '<i class="fa fa-minus fa-2x"></i>'
                                    + '</button>'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                                + '</div>'
                            + '</div>'
                            + '<div class="box-body" style="margin-top: -8px;">'
                                + '<p id="para-' + v.dailyNews.id + '" class="font-justified">'
                                    + v.dailyNews.content
                                + '</p>'
                           + '</div>';
                    } else {
                        var hidden, tendancy, style = "";
                        if (v.tendancy == 1) {
                            style = 'background-color: #008822;color: #fff;';
                            tendancy = 'Pro Government';
                        } else {
                            style = 'background-color: #c10000;color: #fff;';
                            tendancy = 'Pro Oposition';
                        }
                        if (v.read == false) {
                            hidden = "hidden";
                        } else {
                            hidden = "";
                        }
                        element = '<div id=' + v.id + ' class="box box-widget">'
                            + '<div class="box-header with-border">'
                            + '    <div class="user-block" style="margin-bottom: -.35em;">'
                                 + '   <div class="username"><strong>' + v.title + '</strong></div>'
                                  + '  <span class="badge bg-tags" style="padding:2px 7px 3px;margin:0.5em 0 0.15em 0.15em; ' + style + '">'
                                  + '  <small><a href="#" tendancy_id=' + tendancy + ' style="color: inherit;">' + tendancy + '</a></small></span>'
                                  + ' <span class="badge bg-tags badge-simple"><small>' + v.sources.name + '</small></span>'
                                 + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.created_at).fromNow() + '</small></span>'
                                + '</div>'
                                + '<div class="box-tools">'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                        + '<i class="fa fa-minus fa-2x"></i>'
                                    + '</button>'
                                    + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                                + '</div>'
                            + '</div>'
                            + '<div class="box-body" style="margin-top: -8px;">'
                                + ' <span class="badge bg-tags badge-simple" style="margin:-6px;margin-top: -10px;"><small>' + v.sources.name + '</small></span>'
                                + '<p id="para-' + v.id + '" class="font-justified">'
                                    + v.content
                                + '</p>'
                                + "<p class='read-more' style='margin-top: -8px'><a href='#singleNews' onclick='getSingleDailyNews(" + v.id + ")'>Show more</a></p>"
                                + '<span id="checked-' + v.id + '" class=" ' + hidden + ' pull-right"><i style="color:#01791c;" class="fa fa-check-square-o"></i></span>'
                           + '</div>';
                    }
                    $('#mainPage').append(element);
                });
                _isLoaded = true;
                window.localStorage.setItem('_offset', _offset += 20);
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () {
            _isRequesting = false;
            loadingStatus(false)
        });
}
function getAllPlainNews(option) {
    loadingStatus(true);
    _isRequesting = true;
    if ($('body').hasClass('sidebar-open'))
        closeMenu();

    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    if (option)
        data['subject'] = $('#allSubjects').val();
    $('#noiPage').empty()
    return $.post("http://actionnews.1touch.my/mobile/api/getAllPlainNews", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead2 = data.results.length;
                $.each(data.results, function (d, v) {
                    var hidden, bg = "";
                    if (v.read == false) {
                        hidden = "hidden";
                    } else {
                        hidden = "";
                    }
                    var comm_count = v.comments.length > 0 ? '<a href="#commentPage" onclick="getComments(' + v.id + ', 1)">' + v.comments.length + ' comments</a>' :
                        '<a href="#commentPage" onclick="getComments(' + v.id + ', 1)">Add comment</a>';
                    var element = '<div id=' + v.id + ' class="box box-widget" style=' + bg + '>'
                        + '<div class="box-header with-border">'
                        + '    <div class="user-block" style="margin-bottom: -.35em;">'
                             + '   <div class="username"><strong>' + v.title + '</strong></div>'
                              + '  <span class="badge bg-tags" style="padding:2px 7px 3px;margin:0.5em 0 0.15em 0.15em;">'
                              + '  <small><a href="#" subject_id=' + v.subjectid + ' style="color: inherit;">' + v.subject.title + '</a></small></span>'
                              + ' <span class="badge bg-tags badge-simple"><small>' + v.author + '</small></span>'
                             + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.created_at).fromNow() + '</small></span>'
                            + '</div>'
                            + '<div class="box-tools">'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                    + '<i class="fa fa-minus fa-2x"></i>'
                                + '</button>'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                            + '</div>'
                        + '</div>'
                        + '<div class="box-body" style="margin-top: -8px;">'
                            + '<p id="para-' + v.id + '" class="font-justified">'
                                + v.content
                            + '</p>'
                            + "<p class='read-more' style='margin-top: -8px'><a href='#singlePlainNews' onclick='getSinglePlainNews(" + v.id + ")'>Show more</a></p>"
                            + '<div class="row" style="margin-left: 0;margin-top: -4px;" id="tags' + d + '"></div>'
                              + comm_count
                            + '<span id="checked-' + v.id + '" class=" ' + hidden + ' pull-right"><i style="color:#01791c;" class="fa fa-check-square-o"></i></span>'
                       + '</div>';

                    $('#noiPage').append(element);

                    if (v.comments.length > 0) {
                        $('#' + v.id).append('<div id="comments' + d + '" class="box-footer-comment box-comments"></div>');
                        $.each(v.comments, function (i, c) {
                            $('#comments' + d).append('<div class="box-comment"><div class="comment-text"><span class="username">' + c.user.name
                                + '<span class="text-muted pull-right">' + moment(c.created_at).fromNow() + '</span></span>' + c.body + ' </div>')
                        });
                    }
                });
                _isLoaded = true;
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () {
            _isRequesting = false;
            loadingStatus(false)
        });
}
function getSinglePlainNews(id) {
    loadingStatus(true);
    _isRequesting = true;
    if ($('body').hasClass('sidebar-open'))
        closeMenu();
    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    data['newsid'] = id;
    $('#singlePlainNews').empty();
    return $.post("http://actionnews.1touch.my/mobile/api/getSinglePlainNews", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead2 = data.results.length;
                _unreadFlag = true;
                $.each(data.results, function (d, v) {
                    var hidden, bg = "";
                    if (v.read == false) {
                        hidden = "hidden";
                    } else {
                        hidden = "";
                    }
                    var comm_count = v.comments.length > 0 ? '<a href="#commentPage" onclick="getComments(' + v.id + ', 1)">' + v.comments.length + ' comments</a>' :
                        '<a href="#commentPage" onclick="getComments(' + v.id + ', 1)">Add comment</a>';
                    var element = '<div id=single-' + v.id + ' class="box box-widget" style=' + bg + '>'
                        + '<div class="box-header with-border">'
                        + '    <div class="user-block" style="margin-bottom: -.35em;">'
                             + '   <div class="username"><strong>' + v.title + '</strong></div>'
                              + '  <span class="badge bg-tags" style="padding:2px 7px 3px;margin:0.5em 0 0.15em 0.15em;">'
                              + '  <small><a href="#" subject_id=' + v.subjectid + ' style="color: inherit;">' + v.subject.title + '</a></small></span>'
                              + ' <span class="badge bg-tags badge-simple"><small>' + v.author + '</small></span>'
                             + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.created_at).fromNow() + '</small></span>'
                            + '</div>'
                            + '<div class="box-tools">'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                    + '<i class="fa fa-minus fa-2x"></i>'
                                + '</button>'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                            + '</div>'
                        + '</div>'
                        + '<div class="box-body" style="margin-top: -8px;">'
                            + '<p id="para-' + v.id + '" class="font-justified">'
                                + v.content
                            + '</p>'
                            + '<div class="row" style="margin-left: 0;margin-top: -4px;" id="tags' + d + '"></div>'
                              + comm_count
                            + '<span id="checked-' + v.id + '" class=" ' + hidden + ' pull-right"><i style="color:#01791c;" class="fa fa-check-square-o"></i></span>'
                       + '</div>';

                    $('#singlePlainNews').append(element);

                    if (v.comments.length > 0) {
                        $('#single-' + v.id).append('<div id="single-comments' + d + '" class="box-footer-comment box-comments"></div>');
                        $.each(v.comments, function (i, c) {
                            $('#single-comments' + d).append('<div class="box-comment"><div class="comment-text"><span class="username">' + c.user.name
                                + '<span class="text-muted pull-right">' + moment(c.created_at).fromNow() + '</span></span>' + c.body + ' </div>')
                        });
                    }
                });
                _isLoaded = true;
                window.localStorage.setItem('_offset', _offset += 20);
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () {
            _isRequesting = false;
            loadingStatus(false)
        });
}
function getAllTaggedNews(option) {
    loadingStatus(true);
    if ($('body').hasClass('sidebar-open'))
        closeMenu();

    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    if (option)
        data["subject"] = "";
    $('#newsInsight').empty();
    $.post("http://actionnews.1touch.my/mobile/api/getAllTaggedNews", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead3 = data.results.length;
                //console.log('_totalRead3: ', _totalRead3)
                $.each(data.results, function (d, v) {
                    var hidden = v.read == 0 ? "hidden" : "";
                    var style, tendancy = "";
                    var comm_count = v.comments.length > 0 ? '<a href="#commentPage" onclick="getComments(' + v.id + ', 2)">' + v.comments.length + ' comments</a>' :
                        '<a href="#commentPage" onclick="getComments(' + v.id + ', 2)">Add comment</a>';
                    if (v.verdict == 1) {
                        style = 'background-color: #008822;color: #fff;';
                        tendancy = 'Pro Government';
                    } else {
                        style = 'background-color: #c10000;color: #fff;';
                        tendancy = 'Pro Oposition';
                    }
                    var element = '<div class="box box-widget" id=allTag' + v.id + '>'
                        + '<div class="box-header with-border">'
                        + '    <div class="user-block" style="margin-bottom: -.35em;">'
                           + '    <div class="username"><strong>' + v.title + '</strong></div>'
                           + '    <div><span class="description pull-left"><small>' + moment(v.created_at).fromNow() + '</small></span>' //style="margin-right: -58px;margin-top: -26px;"
                           + '     <span class="badge bg-tags pull-right" style="padding:2px 7px 3px;' + style + ' ">'
                              + '   <small><a href="#" verdict_id=' + tendancy + ' style="color: inherit;">' + tendancy + '</a></small>'
                              + '  </span>'
                           + '    </div>'
                              + ' <div id="subcategories' + d + '" style="display: inline-block;"></div>'
                            + '</div>'
                            + '<div class="box-tools">'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                    + '<i class="fa fa-minus fa-2x"></i>'
                                + '</button>'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                            + '</div>'
                        + '</div>'
                        + '<div class="box-body" style="margin-top: -8px;">'
                             + ' <span class="badge bg-tags badge-simple" style="margin:-6px;margin-top: -10px;"><small>' + v.verdicts[0] + '</small></span>'
                             + '<p id="more-noipara-' + v.id + '" class="font-justified">'
                                + v.content
                            + '</p>'
                            + "<p class='read-more' style='margin-top: -14px'><a href='#singleNewsInsight' onclick=getSingleTaggedNews(" + v.id + ")>Show more</a></p>"
                            + '<div id="noi-review-' + v.id + '" class="attachment-block clearfix" style="margin-left:-4px;margin-right:-4px;margin-top: -14px;">'
                                + '<div class="attachment-pushed">'
                                    + '<p class="header-noi-box"><span class="badge bg-tags" style="padding:2px 7px 3px; color: #fff;background-color: #a7a7a7;"><small>Review</small></span></p>' //onclick=fadeInOut("review-fade-' + v.id + '")                                    
                                    + '<div id="more-review-fade-' + v.id + '" class="attachment-text font-justified">' +
                                        v.review
                                    + '</div>'
                                    + "<p class='read-more' style='margin-top: -4px'><a href='#singleNewsInsight' onclick=getSingleTaggedNews(" + v.id + ")>Show more</a></p>"
                                  + '</div>'
                              + '</div>'
                              + '<div id="noi-action-' + v.id + '" class="attachment-block clearfix" style="margin-left:-4px;margin-right:-4px;margin-top: -11px;">'
                                  + '<div class="attachment-pushed">'
                                    + '<p class="header-noi-box" style="margin-top:-10px;"><span class="badge bg-tags" style="padding:2px 7px 3px;color: #fff;background-color: #a7a7a7;"><small>Action</small></spanp></p>' //onclick=fadeInOut("action-fade-' + v.id + '")                                  
                                    + '<div id="more-action-fade-' + v.id + '" class="attachment-text font-justified">' +
                                        v.action
                                    + '</div>'
                                    + "<p class='read-more' style='margin-top: -4px'><a href='#singleNewsInsight' onclick=getSingleTaggedNews(" + v.id + ")>Show more</a></p>"
                                  + '</div>'
                              + '</div>'
                            + '<div id="source-' + d + '" style="font-size: small;margin: -10px 0 6px;"><span style="color:#a9a9a9!important";>Source: </span></div>'
                            + '<div class="row" style="font-size:small;margin-left: 0;margin-top: -4px;" id="tags' + d + '"><span style="color:#a9a9a9!important";>Tags: </span></div>'
                            + '<div style="margin-top: 14px;">'
                                + comm_count
                            + '</div>'
                        + '</div>'
                    + '</div>';
                    // Sources
                    $('#newsInsight').append(element);
                    if(v.sources != null){
                        $.each(v.sources, function (i, s) {
                            $('#source-' + d).append('<a href="#">' + s.title + '</a> ');
                        });                        
                    }
                    if (v.comments.length > 0) {
                        $('#allTag' + v.id).append('<div id="allTag-comments' + d + '" class="box-footer-comment box-comments"></div>');
                        $.each(v.comments, function (i, c) {
                            $('#allTag-comments' + d).append('<div class="box-comment"><div class="comment-text"><span class="username">' + c.user.name
                                + '<span class="text-muted pull-right">' + moment(c.created_at).fromNow() + '</span></span>' + c.body + ' </div>')
                        });
                    }
                    // Categories
                    if (v.categories.length > 0) {
                        //console.log(v.id, v.tags)
                        $.each(v.categories, function (i, c) {
                            // TODO: Only first 3 Tags
                            if (c != null && i < 3)
                                $('#subcategories' + d).append('<span class="badge bg-tags badge-simple" style="margin-left: -6px;"><small>' + c + '</small></span>')
                        });
                    }
                    // tags
                    if (v.tagged_comma != null) {
                        //console.log(v.id, v.tags)
                        $.each(v.tagged_comma.split(','), function (i, t) {
                            // TODO: Only first 3 Tags
                            if (t != null && t != '')
                                $('#tags' + d).append('<div class="tag-margin"><span style="color:#337ab7;background: #f0f8ff;border-radius: 7px;margin:0 1px 2px 2px;"><a href="#" style="color: inherit;">' + t + '</a></span></div>') //badge bg-tags
                        });
                    }
                });
                _isLoaded = true;
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () { loadingStatus(false) });
}
function getSingleTaggedNews(id) {
    loadingStatus(true);
    if ($('body').hasClass('sidebar-open'))
        closeMenu();

    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    data["newsid"] = id;
    $('#singleNewsInsight').empty();
    $.post("http://actionnews.1touch.my/mobile/api/getSingleTaggedNews", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead3 = data.results.length;
                _unreadFlag = true;
                //console.log('_totalRead3: ', _totalRead3)
                $.each(data.results, function (d, v) {
                    var hidden = v.read == 0 ? "hidden" : "";
                    var style, tendancy = "";
                    var comm_count = v.comments.length > 0 ? '<a href="#commentPage" onclick="getComments(' + v.id + ', 2)">' + v.comments.length + ' comments</a>' :
                        '<a href="#commentPage" onclick="getComments(' + v.id + ', 2)">Add comment</a>';
                    if (v.verdict == 1) {
                        style = 'background-color: #008822;color: #fff;';
                        tendancy = 'Pro Government';
                    } else {
                        style = 'background-color: #c10000;color: #fff;';
                        tendancy = 'Pro Oposition';
                    }
                    var element = '<div class="box box-widget" id=allTagSingle' + v.id + '>'
                        + '<div class="box-header with-border">'
                        + '    <div class="user-block" style="margin-bottom: -.35em;">'
                           + '    <div class="username"><strong>' + v.title + '</strong></div>'
                           + '    <div><span class="description pull-left"><small>' + moment(v.created_at).fromNow() + '</small></span>' //style="margin-right: -58px;margin-top: -26px;"
                           + '     <span class="badge bg-tags pull-right" style="padding:2px 7px 3px;' + style + ' ">'
                              + '   <small><a href="#" verdict_id=' + tendancy + ' style="color: inherit;">' + tendancy + '</a></small>'
                              + '  </span>'
                           + '    </div>'
                              + ' <div id="subcategoriesSingle' + d + '" style="display: inline-block;"></div>'
                            + '</div>'
                            + '<div class="box-tools">'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                    + '<i class="fa fa-minus fa-2x"></i>'
                                + '</button>'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                            + '</div>'
                        + '</div>'
                        + '<div class="box-body" style="margin-top: -8px;">'
                             + ' <span class="badge bg-tags badge-simple" style="margin:-6px;margin-top: -10px;"><small>' + v.verdicts[0] + '</small></span>'
                             + '<p id="more-noipara-Single' + v.id + '" class="font-justified">'
                                + v.content
                            + '</p>'
                            + '<div id="noi-review-' + v.id + '" class="attachment-block clearfix" style="margin-left:-4px;margin-right:-4px;margin-top: -14px;">'
                                + '<div class="attachment-pushed">'
                                    + '<p class="header-noi-box"><span class="badge bg-tags" style="padding:2px 7px 3px; color: #fff;background-color: #a7a7a7;"><small>Review</small></span></p>' //onclick=fadeInOut("review-fade-' + v.id + '")                                    
                                    + '<div id="more-review-fade-' + v.id + '" class="attachment-text font-justified">' +
                                        v.review
                                    + '</div>'
                                  + '</div>'
                              + '</div>'
                              + '<div id="noi-action-' + v.id + '" class="attachment-block clearfix" style="margin-left:-4px;margin-right:-4px;margin-top: -11px;">'
                                  + '<div class="attachment-pushed">'
                                    + '<p class="header-noi-box"><span class="badge bg-tags" style="padding:2px 7px 3px;color: #fff;background-color: #a7a7a7;"><small>Action</small></spanp></p>' //onclick=fadeInOut("action-fade-' + v.id + '")                                  
                                    + '<div id="more-action-fade-' + v.id + '" class="attachment-text font-justified">' +
                                        v.action
                                    + '</div>'
                                  + '</div>'
                              + '</div>'
                            + '<div id="source-Single' + d + '" style="font-size: small;margin-bottom: 6px;"><span style="color:#a9a9a9!important";>Source: </span></div>'
                            + '<div class="row" style="font-size:small;margin-left: 0;margin-top: -4px;" id="tagsSingle' + d + '"><span style="color:#a9a9a9!important";>Tags: </span></div>'
                            + '<div style="margin-top: 14px;">'
                                + comm_count
                            + '</div>'
                        + '</div>'
                    + '</div>';
                    $('#singleNewsInsight').append(element);
                    if (v.sources != null) {
                        $.each(v.sources, function (i, s) {
                            $('#source-Single' + d).append('<a href="#">' + s.title + '</a> ');
                        });
                    }
                    if (v.comments.length > 0) {
                        $('#allTagSingle' + v.id).append('<div id="allTagSingle-comments' + d + '" class="box-footer-comment box-comments"></div>');
                        $.each(v.comments, function (i, c) {
                            $('#allTagSingle-comments' + d).append('<div class="box-comment"><div class="comment-text"><span class="username">' + c.user.name
                                + '<span class="text-muted pull-right">' + moment(c.created_at).fromNow() + '</span></span>' + c.body + ' </div>')
                        });
                    }
                    // Categories
                    if (v.categories.length > 0) {
                        //console.log(v.id, v.tags)
                        $.each(v.categories, function (i, c) {
                            // TODO: Only first 3 Tags
                            if (c != null && i < 3)
                                $('#subcategoriesSingle' + d).append('<span class="badge bg-tags badge-simple" style="margin-left: -6px;"><small>' + c + '</small></span>')
                        });
                    }
                    // tags
                    if (v.tagged_comma != null) {
                        //console.log(v.id, v.tags)
                        $.each(v.tagged_comma.split(','), function (i, t) {
                            // TODO: Only first 3 Tags
                            if (t != null && t != '')
                                $('#tagsSingle' + d).append('<div class="tag-margin"><span style="color:#337ab7;background: #f0f8ff;border-radius: 7px;margin:0 1px 2px 2px;"><a href="#" style="color: inherit;">' + t + '</a></span></div>') //badge bg-tags
                        });
                    }
                });
                _isLoaded = true;
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () { loadingStatus(false) });
}
function getSingleDailyNews(id) {
    loadingStatus(true);
    _isRequesting = true;
    if ($('body').hasClass('sidebar-open'))
        closeMenu();

    var data = new Object();
    data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
    data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
    data['newsid'] = id;
    $('#singleNews').empty();
    return $.post("http://actionnews.1touch.my/mobile/api/getSingleDailyNews", data)
        .success(
        function (data) {
            if (data != null) {
                _totalRead = data.results.length;
                $.each(data.results, function (d, v) {
                    var hidden, tendancy, style = "";
                    if (v.tendancy == 1) {
                        style = 'background-color: #008822;color: #fff;';
                        tendancy = 'Pro Government';
                    } else {
                        style = 'background-color: #c10000;color: #fff;';
                        tendancy = 'Pro Oposition';
                    }

                    if (v.read == false) {
                        hidden = "hidden";
                    } else {
                        hidden = "";
                    }
                    var element = '<div id=' + v.id + ' class="box box-widget">'
                        + '<div class="box-header with-border">'
                        + '    <div class="user-block" style="margin-bottom: -.35em;">'
                             + '   <div class="username"><strong>' + v.title + '</strong></div>'
                              + '  <span class="badge bg-tags" style="padding:2px 7px 3px;margin:0.5em 0 0.15em 0.15em; ' + style + '">'
                              + '  <small><a href="#" tendancy_id=' + tendancy + ' style="color: inherit;">' + tendancy + '</a></small></span>'
                              //+ ' <span class="badge bg-tags badge-simple"><small>' + v.sources.name + '</small></span>'
                             + ' <span class="badge bg-tags badge-simple pull-right description "><small>' + moment(v.created_at).fromNow() + '</small></span>'
                            + '</div>'
                            + '<div class="box-tools">'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="collapse">'
                                    + '<i class="fa fa-minus fa-2x"></i>'
                                + '</button>'
                                + '<button type="button" class="hidden btn btn-box-tool" data-widget="remove"><i class="fa fa-times fa-2x"></i></button>'
                            + '</div>'
                        + '</div>'
                        + '<div class="box-body" style="margin-top: -8px;">'
                            + ' <span class="badge bg-tags badge-simple" style="margin:-6px;margin-top: -10px;"><small>' + v.sources.name + '</small></span>'
                            + '<p id="para-' + v.id + '" class="font-justified">'
                                + v.content
                            + '</p>'
                            + '<span id="checked-' + v.id + '" class=" ' + hidden + ' pull-right"><i style="color:#01791c;" class="fa fa-check-square-o"></i></span>'
                       + '</div>';

                    $('#singleNews').append(element);
                });
                _isLoaded = true;
                _unreadFlag = true;
            } else
                alert("Loading faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)

        })
        .complete(function () {
            _isRequesting = false;
            loadingStatus(false)
        });
}
function getComments(id, type) {
    $('#commentParents').empty();
    $('#commentParents').attr('news-type', type).attr('news-id', id);
    var url = type == 1 ? 'getAllPlainComment' : 'getAllTaggedComment';
    if (!_isRequesting) {
        _isRequesting = true;
        var data = new Object();
        data['email'] = JSON.parse(window.localStorage.getItem("user")).email;
        data['password'] = JSON.parse(window.localStorage.getItem("user")).password;
        data['newsid'] = id;
        $.post("http://actionnews.1touch.my/mobile/api/" + url, data)
            .success(
            function (data) {
                if (data.results != null && data.results.length > 0) {
                    $('#commentParents').removeClass('hidden');
                    $.each(data.results, function (d, v) {
                        var element = '<div class="box-comment"> '
                        + ' <div class="comment-text"> '
                        + '     <span class="username"> '
                        + v.user.name
                        + '      <span class="text-muted pull-right">' + moment(v.created_at).fromNow() + '</span> '
                        + '     </span> '
                        + v.body
                        + ' </div> '
                        + ' </div>';

                        $('#commentParents').append(element);
                    });
                } else
                    $('#commentParents').addClass('hidden');
            })
            .error(function (e) {
            })
        .complete(function () {
            _isRequesting = false;
            loadingStatus(false);
        });
    }
}
function postComment() {
    if (!_isRequesting) {
        var id = parseInt($('#commentParents').attr('news-id'));
        var type = $('#commentParents').attr('news-type');
        var content = $('#new-comment').val();
        var url = type == 1 ? 'addPlainComment' : 'addTaggedComment';

        var data = new Object();
        data["email"] = JSON.parse(window.localStorage.getItem("user")).email;
        data["password"] = JSON.parse(window.localStorage.getItem("user")).password;
        data["newsid"] = id;
        data["comment"] = content;

        if (data.comment != "") {
            _isRequesting = true;
            $.ajax({
                url: "http://actionnews.1touch.my/mobile/api/" + url,
                type: "POST",
                data: data,
                success: function (data) {
                    _isRequesting = false;
                    if (data != null) {
                        var element = '<div class="box-comment"> '
                            + ' <div class="comment-text"> '
                            + '     <span class="username">You<span class="text-muted pull-right">' + moment().startOf('min').fromNow() + '</span> '
                            + '     </span> '
                            + content
                            + ' </div> '
                            + ' </div>';

                        $('#commentParents').append(element).removeClass('hidden');
                        $('#new-comment').val('');

                        // refresh the news/comments
                        //if (type == 1)
                        //    getAllPlainNews(false);
                        //else if(type == 2)
                        //    getAllTaggedNews(false);
                    }
                },
                error: function (e) {
                    _isRequesting = false;
                },
                complete: function () {
                    loadingStatus(false);
                }
            });
        }
    }
}
function setTotalStatus() {
    // Daily Update == getAllDailyNews
    // Selected News == getAllPlainNews
    // News insight == getAllTaggedNews
    return $.post("http://actionnews.1touch.my/mobile/api/getUnreadNewsCounter", JSON.parse(window.localStorage.getItem("user")))
            .success(
            function (data) {
                if (data != null) {
                    if (data.result == "success") {
                        _unRead = data.results.dailynews; // Daily Update
                        _unRead2 = data.results.plainnews; // Selected news
                        _unRead3 = data.results.taggednews; // News insight
                    }else
                        alert('Please logout and login again!')
                }
            })
        .done(function (d) { });
}