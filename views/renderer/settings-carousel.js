var mSettings = null;

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
        console.log("xxxxx");
        var formObj = $("#settings-form").serializeObject();
        console.log(formObj);
    });
}
