/**
 * IPC Module
 * ---------------------
 *   channel 1 : EIS 정보 설정
 */

const { ipcMain } = require("electron");
const logger = require("../utils/logger");
const util = require("../utils/util");
const model = require("../model");
const eventEmitter = require("./event-emitter");
const { app } = require("electron");
const TAG = "[IPC-MAIN]";

// ipcMain에서의 이벤트 수신
ipcMain.on("app-is-packaged", async (evt, data) => {
    logger.info(TAG, "Renderer request app-is-packaged.");
    mainWindow.webContents.send("app-is-packaged", app.isPackaged);
});

ipcMain.on("devtool-control", (evt, isShow) => {
    logger.info(TAG, "devtool-control received =", isShow);
    if (isShow) {
        devTools.show();
        mainWindow.webContents.send("devtool-status", true);
    } else {
        devTools.hide();
        mainWindow.webContents.send("devtool-status", false);
    }
});

ipcMain.on("system-settings", async (evt, payload) => {
    logger.info(TAG, "system-settings ipc received =", payload);
    const result = await model.settings(payload);
    mainWindow.webContents.send("system-settings", result);
});

var mainWindow = null;
var devTools = null;
// for devtool control
module.exports.sendToRenderer = (channel, payload) => {
    if (!mainWindow) {
        return;
    }
    try {
        mainWindow.webContents.send(channel, payload);
    } catch (e) {}
};

module.exports.setWindow = (main, dev) => {
    mainWindow = main;
    devTools = dev;
};
