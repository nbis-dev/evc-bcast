"use strict";

const FORMKEYS = [
    "application_init",
    "csms_address",
    "csms_port",
    "evc_baudrate",
    "evc_comport",
    "evc_monitorperiod",
    "evc_watchdogperiod",
    "system_model",
    "system_password",
    "system_product",
    "system_uuid",
];

const INPUTDEV = [
    "0",
    "http://ev-dev.namboo.co.kr",
    "3000",
    "COM4",
    "115200",
    "1000",
    "8000",
    "NBIS-DID7k",
    "@!nbnetworks365@!",
    "NBIS",
    "NBIS-DID7k-128",
];

const showInitSettingsAlert = () => {
    swal({
        title: "초기 설정 필요",
        html: "시스템의 기본 설정이 완료되지 않았습니다.<br>설정을 진행해 주세요.",
        allowOutsideClick: false,
        allowEscapeKey: false,
    });
};

// function으로 명시해 주어야 함.
function initSettingsPages() {
    $(`#settings-submit`).on("click", () => {
        var formObj = $("#settings-form").serializeObject();
        checkValidateForm(formObj);
    });
}

// function으로 명시해 주어야 함.
function loadSettingsCompleted() {
    // set settings data
    for (var i = 0; i < FORMKEYS.length; i++) {
        if (mSettings["application_init"] === "0" && mIsPackaged === false) {
            // 개발시에는 미리 넣어준다.
            $(`#${FORMKEYS[i]}`).val(INPUTDEV[i]);
        } else {
            if (isNullObject(mSettings[FORMKEYS[i]])) {
                $(`#${FORMKEYS[i]}`).val("");
            } else {
                $(`#${FORMKEYS[i]}`).val(mSettings[FORMKEYS[i]]);
            }
        }
    }
}

const checkValidateForm = (obj) => {
    console.log(obj);
};
