/**
    electron에서 better-sqlite3 모듈을 사용할 경우 아래와 같은 문제가 발생하는 경우가 있다.

    node_modules\sqlite3\lib\binding\electron-v4.0-win32-x64\node_sqlite3.node' was compiled against a different Node.js version using NODE_MODULE_VERSION 64. This version of Node.js requires NODE_MODULE_VERSION 69. Please try re-compiling or re-installing the module (for instance, using npm rebuildornpm install).
    위와 같은 문제가 발생했다면 아래와 같이 시도해 보자.

    ----------------------------------------------------------------------------------------------------------------------
    # 1. electron-rebuild 설치
    $ npm i --save-dev electron-rebuild
    # 또는
    $ yarn add -D electron-rebuild

    # electron-rebuild를 이요해서 rebuild
    $ npx electron-rebuild -f -w better-sqlite3
    ----------------------------------------------------------------------------------------------------------------------
*/
"use strict";

const Database = require("./sqlite-async");

const util = require("util");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const logger = require("../utils/logger");
const lutil = require("lodash");
var db = null;

const TAG = "[SQLITE3]";
const DBNAME = "db.sqlite3";
const dbDir = process.env["DB_PATH"];

process.on("exit", async () => {
    try {
        await db.close();
    } catch (e) {}
});
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));

const TABLE_NAMES = {
    settings: "TB_SETTINGS",
    // charge_history: "TB_CHARGE_HISTORY",
    // local_authorize: "TB_LOCAL_AUTHORIZE"
};

const TABLE_DEFS = [
    {
        name: TABLE_NAMES.settings,
        columns: [
            "\n\tcategory VARCHAR(32) NOT NULL",
            "\n\tattribute VARCHAR(32) NOT NULL",
            "\n\tvalue VARCHAR(128) DEFAULT NULL",
            "PRIMARY KEY (category, attribute)",
        ],
    },
    // {
    //     name: TABLE_NAMES.eis_device,
    //     columns: [
    //         "\n\tid INTEGER PRIMARY KEY AUTOINCREMENT",
    //         "\n\tsys_id INTEGER", // 상위 담당구간 ID
    //         "\n\tis_default BOOLEAN NOT NULL CHECK (is_default IN (0, 1))",
    //         "\n\tname VARCHAR(20) NOT NULL",
    //         "\n\tdev_num INTEGER", // 1/2계 하드웨어 순서
    //         "\n\tnetworks TEXT", // 1/2계 네트워크 설정, Json으로 저장
    //         "\n\tdesc VARCHAR(100)",
    //         "\n\tregdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    //     ],
    //     constraint:
    //         ",\n\tCONSTRAINT fk_eis_system" +
    //         "\n\t\tFOREIGN KEY (sys_id)" +
    //         "\n\t\tREFERENCES TB_EIS_SYSTEM(id)" +
    //         "\n\t\tON UPDATE CASCADE" +
    //         "\n\t\tON DELETE CASCADE",
    //     autoincrement: true,
    //     autoincrement_init: 100000000,
    // },
];
var CREATE_TABLE_STMT = "CREATE TABLE IF NOT EXISTS %s (%s %s)";
const AUTOINCREMENT_SETTING_STMT =
    "INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)";

async function isTableExist(name) {
    try {
        const query =
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
        const stmt = await db.prepare(query, name);
        return (await stmt.all()).length > 0;
    } catch (e) {
        new Exception(e);
    }
}

// 테이블 생성 - 초기화 과정
(async () => {
    try {
        db = await Database.open(
            path.join(dbDir, DBNAME),
            Database.OPEN_READWRITE | Database.OPEN_CREATE
        );

        // array for ... of
        await db.run("BEGIN");
        for (const table of TABLE_DEFS) {
            if (await isTableExist(table.name)) {
                logger.debug(TAG, "Init Database : already exist", table.name);
                continue;
            }
            logger.info(TAG, "Create Table name =", table.name);

            var query = util.format(
                CREATE_TABLE_STMT,
                table.name,
                table.columns.join(", "),
                Boolean(table.constraint) ? table.constraint : ""
            );

            await db.run(query);

            // when set autoincrement value
            if (
                table.autoincrement === true &&
                lutil.isNumber(table.autoincrement_init) &&
                table.autoincrement_init > 1
            ) {
                logger.info(
                    TAG,
                    "\t- AutoIncrement value set =",
                    table.autoincrement_init
                );

                await db.run(
                    util.format(
                        AUTOINCREMENT_SETTING_STMT,
                        table.name,
                        table.autoincrement_init
                    )
                );
            }

            if (table.name === TABLE_NAMES.settings) {
                await presetSettings(table.name);
            }
        }

        await db.run("COMMIT");
    } catch (e) {
        logger.error(e, e.stack);
        await db.run("ROLLBACK");
        app.exit();
    }
})();

const presetSettings = async (name) => {
    try {
        var sql = `INSERT INTO ${name} (category, attribute, value) values (?, ?, ?)`;
        const values = [
            ["application", "init", "0"],
            ["system", "product", null],
            ["system", "model", null],
            ["system", "uuid", null],
            ["system", "password", null],
            ["csms", "address", null],
            ["csms", "port", null],
            ["evc", "comport", null],
            ["evc", "baudrate", null],
            ["evc", "monitorperiod", null],
            ["evc", "watchdogperiod", null],
        ];
        for (const row of values) {
            await db.run(sql, row); // spread each sub-array to pass the individual elements
        }
    } catch (e) {
        logger.error(TAG, e, e.stack);
        throw new Error(e.message);
    }
};

const SETTINGS_CMD = {
    GET: 0,
    SET: 1,
};

const getSettings = async () => {
    try {
        var sql = `SELECT * FROM ${TABLE_NAMES.settings} ORDER BY category ASC;`;
        const result = await db.all(sql);
        return { success: true, data: result };
    } catch (e) {
        logger.error(TAG, e, e.stack);
        return { success: false };
    }
};

module.exports.settings = async (data) => {
    try {
        const cmd = data.cmd;
        delete data.cmd;

        if (cmd === SETTINGS_CMD.GET) {
            return await getSettings(data);
        } else if (cmd === SETTINGS_CMD.SET) {
            logger.info(TAG, "setSettings", "not enable yet !!!!");
            return { success: true };
        }

        logger.error(TAG, "Unknown settings command !!! =", cmd);
        return { success: false };
    } catch (e) {
        logger.error(TAG, e, e.stack);
        return { success: false };
    }
};
