let countInCheck, sel, real, timerDel, timerLoad,
    items = $("ytd-two-column-browse-results-renderer #items"),
    needCount = 20;

// Т.к. Ютуб не загружает каждый раз страницу, а работает с фреймами, то мы вешаем таймер, на проверку текущего адреса, и при необходимости добавляем кноку
setInterval(() => {
    if (window.location.href.match(/https:\/\/www\.youtube\.com\/c\/.*\/videos.*/).length != 0) {
        if (!$('#CustomFilter').length)
            addButton();
    }
}, 1000);

// Удаляю выбранные видео
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

// Проверяю количество и при необходимости загружаю новые видео
function checkCount() {
    let count,
        scroll = $(window).scrollTop();

    function tick() {
        count = $("ytd-two-column-browse-results-renderer #items ytd-grid-video-renderer");
        if (count.length < needCount) {
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

// Добавляю кнопку
function addButton() {
    $('<div id="CustomFilter" class="style-scope yt-dropdown-menu">' +
        '<div id="FilterList" class="expand"> <img src="https://i.ibb.co/LhJc5TZ/filter.png"/>Фильтр видео </div>' +
        '<ul class="dropdown-content style-scope paper-menu-button">' +
        '<li value="none">Скрыть все новые видео</li>' +
        '<li value="viewer">Скрыть все просмотренные видео</li>' +
        '</ul>' +
        '</div>').insertAfter("#primary-items");

    // По умолчанию кнопка скрыта
    $("#CustomFilter ul").hide();

    // При щелчке раскрываем список
    $("#CustomFilter #FilterList").click(function() {
        $(this).next().animate({ 'height': 'toggle' });
    });

    // Прячем выпадающее меню, когда пользователь щелкает в другом месте
    $(document).mouseup(function(e) {
        var container = $("#CustomFilter ul");
        if (container.has(e.target).length === 0) {
            container.hide();
        }
    });

    addAction();
}

// Вешаем листенер на нажатие кнопки фильтра
function addAction() {
    $("#CustomFilter li").unbind("click").click(function() {
        $(this).attr("checked", "true");
        sel = $(this).attr("value");
        $("#CustomFilter li").not(this).removeAttr("checked");
        $("#CustomFilter ul").hide();

        // Первый запуск функций, после выбора необходимой функции
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

        // Удаляем видео
        clear();
    });
}