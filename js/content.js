let countInCheck, sel, real, timerDel, timerLoad, items, observerFilter, observerVideo,
    content = $("#content")[0],
    needCount = 20,
    href = document.location.href;

//слушатель на content, для определения перехода на канал
let observHash = new MutationObserver(function(mutations) {
    href = document.location.href;
    if (href.match("youtube.com/c/.*")) {
        mutations.forEach(mutation => {
            if (mutation.target.matches('#tabsContent')) {
                addButton();
            }
        });
    } else {
        deleteButton();
    }
});

let observHashConfig = {
    subtree: true,
    childList: true
};
// проверяю URL при первом открытии
if (href.match("youtube.com/c/.*")) {
    addButton();
} else {
    deleteButton();
}

// запускаю слушатель в ожидании перехода на канал
observHash.observe(content, observHashConfig);

// Удаляю выбранные видео
function clear() {
    let videoList = $("#contents #items")[0];
    observerVideo = new MutationObserver(function(mutations) {
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

    observerVideo.observe(videoList, {
        childList: true,
        subtree: true
    });
}

// Проверяю количество и, при необходимости, загружаю новые видео
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

function waitHeaderMenu() {
    let observerFilter = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation == mutations[mutations.length - 1]) {
                observerFilter.disconnect();
                addButton();
            }
        });
    });

    observerFilter.observe($("#sub-menu")[0], {
        subtree: true,
        childList: true
    });
}

// Добавляю кнопку
function addButton() {
    let menu = $("#tabsContent")[0],
        menuVideoTab = $("#tabsContent tp-yt-paper-tab")[1];

    //слушатель на меню, для добавления / удаления кнопки
    let observerMenu = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation.target.attributes["aria-selected"].value == "true") {
                mutation.target == menuVideoTab ? waitHeaderMenu() : deleteButton();
            }
        });
    });

    let observerMenuConfig = {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-selected"]
    };

    observerMenu.observe(menu, observerMenuConfig);

    if (menuVideoTab.getAttribute("aria-selected") == "true") {
        if (!$('#CustomFilter').length) {
            let button = chrome.i18n.getMessage('button'),
                filter1 = chrome.i18n.getMessage('filter1'),
                filter2 = chrome.i18n.getMessage('filter2');


            if (document.querySelector("html").getAttribute("dark")) {
                $(`<div id="CustomFilter" class="style-scope yt-dropdown-menu">
                            <div id="FilterList" class="expand"> <img src="https://i.ibb.co/KqhSTQb/Screenshot-1.png"/>${button}</div>
                            <div id=menu>
                            <ul class="dropdown-content style-scope paper-menu-button dark">
                            <li class="item dark" value="none">${filter1}</li>
                            <li class="item dark" value="viewer">${filter2}</li>
                            </ul>
                            </div></div>`).insertAfter("#primary-items");
            } else {
                $(`<div id="CustomFilter" class="style-scope ytd-channel-sub-menu-renderer">
                            <div id="FilterList" class="expand"> <img src="https://i.ibb.co/JpF9yST/filter.png"/>${button}</div>
                            <div id=menu>
                            <ul class="dropdown-content style-scope paper-menu-button">
                            <li class="item " value="none">${filter1}</li>
                            <li class="item" value="viewer">${filter2}</li>
                            </ul>
                            </div></div>`).insertAfter("#primary-items");
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
    }
}

// Удаляю кнопку
function deleteButton() {
    $("#CustomFilter").remove();
    if (observerVideo) {
        observerVideo.disconnect();
    }
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