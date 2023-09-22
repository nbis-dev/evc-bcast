"use strict";
// const electron = require("electron");
const lutil = require("lodash");
const electron = require("electron");

const CAROUSEL_ID = "#page_carousel";
var mCurrentSlide = 0; // carousel num 0
var mIsPackaged = false;
var mSettings = {};

const mPages = [
    "loading-carousel",
    "settings-carousel",
    "evc-hmi-carousel",
    "logs-carousel",
];
const PAGES = {
    LOADING: 0,
    SETTINGS: 1,
    EVCHMI: 2,
    LOG: 3,
};

$(async () => {
    isAppPackaged();
    $("#page_carousel").carousel({
        pause: true,
        interval: false,
    });
    for (let idx = 0; idx < mPages.length; idx++) {
        // loading-carousel은 html이 이미 불려져 있다.
        if (idx === 0) continue;
        $(`#${mPages[idx]}`).load(`partials/${mPages[idx]}.html`, () => {
            var funcName = mPages[idx].split("-")[0];
            funcName =
                "init" +
                funcName.charAt(0).toUpperCase() +
                funcName.slice(1) +
                "Pages";
            window[funcName]();
        });
    }

    // check is initialized and settings
    // so send ipc to main - get settings
    getSettings(SETTINGS_CMD.GET, {});
});

const onReceiveSettings = (payload) => {
    if (!payload.success) {
        // show error log......
        return;
    }

    for (var idx in payload.data) {
        mSettings[
            `${payload.data[idx].category}_${payload.data[idx].attribute}`
        ] = payload.data[idx].value;
    }

    if (mCurrentSlide === 0 && mSettings.application_init === "0") {
        setTimeout(() => {
            showInitSettingsAlert();
        }, 2500);
        setTimeout(() => {
            $(CAROUSEL_ID).carousel(PAGES.SETTINGS);
        }, 2500);
    }
};

const onAppIsPackaged = (isPackaged) => {
    mIsPackaged = isPackaged;
};
const onDevtoolStatusChanged = (isShow) => {
    var checkValue = $('input:checkbox[name="devtool_checkbox"]').is(
        ":checked"
    );
    if (isShow !== checkValue) {
        $('input:checkbox[name="devtool_checkbox"]').prop("checked", isShow);
    }
};

$(CAROUSEL_ID).on("slid.bs.carousel", (e) => {
    var slideFrom = $(this).find(".active").index();
    var slideTo = $(e.relatedTarget).index();
    mCurrentSlide = slideTo;

    var name = mPages[mCurrentSlide].split("-")[0];
    var funcName = mPages[mCurrentSlide].split("-")[0];
    funcName =
        "load" +
        funcName.charAt(0).toUpperCase() +
        funcName.slice(1) +
        "Completed";
    window[funcName]();
});
