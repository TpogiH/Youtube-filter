let countInCheck, sel, real, timerDel, timerLoad,
    items = $("ytd-two-column-browse-results-renderer #items");




$("ytd-two-column-browse-results-renderer").ready(function() {
    $('<div id="CustomFilter" class="style-scope yt-dropdown-menu">' +
        '<div id="FilterList" class="expand"> <img src="https://i.ibb.co/LhJc5TZ/filter.png"/>Фильтр видео </div>' +
        '<ul class="dropdown-content style-scope paper-menu-button">' +
        //'<li value="1">Скрыть все начатые видео</li>' +
        //'<li value="50">Скрыть все видео просмотренные более половины</li>' +
        '<li value="none">Скрыть все новые видео</li>' +
        '<li value="viewer">Скрыть все просмотренные видео</li>' +
        '</ul>' +
        '</div>').insertAfter("#primary-items");
    $("#CustomFilter ul").hide();
    $("#CustomFilter #FilterList").click(function() {
        $(this).next().animate({ 'height': 'toggle' });
    });

    $("#CustomFilter li").unbind("click").click(function() {
        $(this).attr("checked", "true");
        sel = $(this).attr("value");
        $("#CustomFilter li").not(this).removeAttr("checked");
        $("#CustomFilter ul").hide();
        items.children().each(function() {
            if (sel == 'none') {
                if ($(this).find("#progress").length == 0) {
                    $(this).remove();
                    if (!countInCheck) {
                        countInCheck = true;
                        checkCount();
                    }
                }
            } else if (sel == "viewer") {
                if ($(this).find("#progress").length == 1) {
                    $(this).remove();
                    if (!countInCheck) {
                        countInCheck = true;
                        checkCount();
                    }
                }
            }
        });
        clear();
    });
    $(document).mouseup(function(e) {
        var container = $("#CustomFilter ul");
        if (container.has(e.target).length === 0) {
            container.hide();
        }
    });

});


function clear() {
    if (sel == "none") {
        $("ytd-two-column-browse-results-renderer #items").unbind("DOMNodeInserted").on("DOMNodeInserted", "YTD-THUMBNAIL-OVERLAY-TIME-STATUS-RENDERER", function(event) {
            if (event.target.nodeName == "YTD-THUMBNAIL-OVERLAY-TIME-STATUS-RENDERER") {
                if ($(event.target).parent().children().length != 3) {
                    $(event.target).closest("ytd-grid-video-renderer").remove();
                    if (!countInCheck) {
                        countInCheck = true;
                        checkCount();
                    }
                }
            }

        });
    } else if (sel == "viewer") {
        $("ytd-two-column-browse-results-renderer #items").unbind("DOMNodeInserted").on("DOMNodeInserted", "YTD-THUMBNAIL-OVERLAY-RESUME-PLAYBACK-RENDERER", function(event) {
            $(event.target).closest("ytd-grid-video-renderer").remove();
            if (!countInCheck) {
                countInCheck = true;
                checkCount();
            }
        });
    }
}

function checkCount() {
    let count,
        scroll = $(window).scrollTop();

    function tick() {
        count = $("ytd-two-column-browse-results-renderer #items ytd-grid-video-renderer");
        if (count.length < 20) {
            scroll = $(window).scrollTop();
            document.querySelector('yt-next-continuation').scrollIntoView();
            $('html, body').scrollTop(0);
            $(window).scrollTop(scroll);
        } else {
            countInCheck = false;
            clearInterval(timerLoad);
        }
    }
    timerLoad = setInterval(tick, 300);
}