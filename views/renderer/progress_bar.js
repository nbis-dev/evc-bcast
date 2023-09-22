function showProcessingPage(msg) {
    $.blockUI({
        message: !msg
            ? '<div class="spinner-border text-primary mr-1" role="status"><span class="sr-only">Loading...</span></div> 데이터를 불러 오는 중입니다'
            : msg,
        css: {
            border: "none",
            baseZ: 10000,
            padding: "15px",
            backgroundColor: "#000",
            "-webkit-border-radius": "10px",
            "-moz-border-radius": "10px",
            // opacity: 0.5,
            fontSize: "16px",
            color: "#fff",
        },
    });
}

function stopProcessingPage() {
    $.unblockUI();
}
