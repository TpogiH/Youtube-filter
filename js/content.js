let countInCheck, sel, real, timerDel, timerLoad, items,
    needCount = 20,
    el = $("#contents #items")[0];

// Т.к. Ютуб не загружает каждый раз страницу, а работает с фреймами, то мы вешаем таймер, на проверку текущего адреса, и при необходимости добавляем кноку
setInterval(() => {
    if (window.location.href.match(/https:\/\/www\.youtube\.com\/.*\/videos.*/)) {
        if (!$('#CustomFilter').length)
            addButton();
    } else {
        deleteButton();
    }
}, 500);

// Удаляю выбранные видео
function clear() {
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (sel == "none") {
                if (mutation.target.matches('div#overlays')) {
                    if (mutation.target.childNodes.length != 3) {
                        mutation.target.closest("ytd-grid-video-renderer").remove();
                        if (!countInCheck) {
                            countInCheck = true;
                            checkCount();
                        }
                    }
                }
            } else if (sel == "viewer") {
                if (mutation.target.matches('ytd-thumbnail-overlay-resume-playback-renderer')) {
                    mutation.target.closest("ytd-grid-video-renderer").remove();
                    if (!countInCheck) {
                        countInCheck = true;
                        checkCount();
                    }
                }
            }

            // Убираю анимацию загрузки
            if (mutation.target.matches('ytd-continuation-item-renderer')) {
                $("ytd-continuation-item-renderer:not(:last)").remove();
            }
        });
    });

    observer.observe(el, {
        childList: true,
        subtree: true,
    });
}

// Проверяю количество и при необходимости загружаю новые видео
function checkCount() {
    let count,
        scroll = $(window).scrollTop();

    function tick() {
        count = $("ytd-two-column-browse-results-renderer #items ytd-grid-video-renderer");
        if (count.length < needCount) {
            scroll = $(window).scrollTop();
            document.querySelector('ytd-continuation-item-renderer').scrollIntoView();
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
    if (document.querySelector("html").getAttribute("dark")) {
        $('<div id="CustomFilter" class="style-scope yt-dropdown-menu">' +
            '<div id="FilterList" class="expand"> <img src="https://i.ibb.co/KqhSTQb/Screenshot-1.png"/>Фильтр видео </div>' +
            '<div id=menu>' +
            '<ul class="dropdown-content style-scope paper-menu-button dark">' +
            '<li class="item dark" value="none">Удалить все новые видео</li>' +
            '<li class="item dark" value="viewer">Удалить все просмотренные видео</li>' +
            '</ul>' +
            '</div></div>').insertAfter("#primary-items");
    } else {
        $('<div id="CustomFilter" class="style-scope ytd-channel-sub-menu-renderer">' +
            '<div id="FilterList" class="expand"> <img src="https://i.ibb.co/JpF9yST/filter.png"/>Фильтр видео </div>' +
            '<div id=menu>' +
            '<ul class="dropdown-content style-scope paper-menu-button">' +
            '<li class="item " value="none">Удалить все новые видео</li>' +
            '<li class="item" value="viewer">Удалить все просмотренные видео</li>' +
            '</ul>' +
            '</div></div>').insertAfter("#primary-items");
    }


    // По умолчанию кнопка скрыта
    $("#CustomFilter #menu").hide();

    // При щелчке раскрываем список
    $("#CustomFilter #FilterList").click(function() {
        $(this).next().animate({ 'height': 'toggle' });
    });

    // Прячем выпадающее меню, когда пользователь щелкает в другом месте
    $(document).mouseup(function(e) {
        var container = $("#CustomFilter #menu");
        if (container.has(e.target).length === 0) {
            container.hide();
        }
    });

    addAction();
}

// Удаляю кнопку
function deleteButton() {
    $("#CustomFilter").remove();
}

// Вешаем листенер на нажатие кнопки фильтра
function addAction() {
    $("#CustomFilter li").unbind("click").click(function() {
        $(this).attr("checked", "true");
        sel = $(this).attr("value");
        $("#CustomFilter li").not(this).removeAttr("checked");
        $("#CustomFilter #menu").hide();

        // Первый запуск, после выбора необходимой функции
        items = $("ytd-two-column-browse-results-renderer #items");
        items.children().each(function() {
            if (sel == 'none') {
                if ($(this).find("#progress").length == 0 && $(this)[0].nodeName != 'YTD-CONTINUATION-ITEM-RENDERER') {
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