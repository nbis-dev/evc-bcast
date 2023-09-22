"use strict";
/**
 * Renderer main process
 */
const { ipcRenderer } = require("electron");
const SETTINGS_CMD = {
    GET: 0,
    SET: 1,
};

// eis-config 대한 처리결과 이벤트 수신
ipcRenderer.on("app-is-packaged", (evt, isPackaged) => {
    onAppIsPackaged(isPackaged);
});

ipcRenderer.on("devtool-status", (evt, isShow) => {
    console.log("Renderer received ipc(devtool-status) = ", isShow);
    onDevtoolStatusChanged(isShow);
});

ipcRenderer.on("system-settings", (evt, data) => {
    console.log("Renderer received ipc(system-settings) = ", data);
    onReceiveSettings(data);
});

const setDevToolsView = (isShow) => {
    ipcRenderer.send("devtool-control", isShow);
};

const isAppPackaged = async () => {
    ipcRenderer.send("app-is-packaged", null);
};
const getSettings = async (cmd, data) => {
    ipcRenderer.send("system-settings", Object.assign({ cmd: cmd }, data));
};
