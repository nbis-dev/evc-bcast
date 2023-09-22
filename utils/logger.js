/**
 * winstone-daily-rotate-file을 사용
 * winston의 로그 레벨
 * { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
 */
const fs = require("fs");
var moment = require("moment-timezone"); // 로그파일 제목에 일자를 표시하기 위해 사용

const winston = require("winston");
const WinstonDaily = require("winston-daily-rotate-file");
const path = require("path");
const { SPLAT } = require("triple-beam");
const { isObject } = require("lodash");
const { version } = require("root-require")("package.json");
const { combine, timestamp, printf, colorize, label, align } = winston.format;
const { app } = require("electron");

const logPath = process.env["LOG_PATH"];
const isPackaged = app.isPackaged;

const levels = {
    error: 0,
    warn: 1,
    notice: 2,
    info: 3,
    debug: 4,
};

const colors = {
    error: "red",
    warn: "yellow",
    notice: "blue",
    info: "green",
    debug: "white",
};
winston.addColors(colors);

const level = () => {
    return isPackaged === true ? "warn" : "debug";
};

function formatObject(param) {
    if (isObject(param)) {
        return JSON.stringify(param);
    }
    return param;
}

// Ignore log messages if they have { private: true }
const all = winston.format((info) => {
    const splat = info[SPLAT] || [];
    const message = formatObject(info.message);
    const rest = splat.map(formatObject).join(" ");
    info.message = `${message} ${rest}`;
    return info;
});

// Log Format
const logFormat = combine(
    all(),
    label({ label: version }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS\t" }),
    colorize(),
    align(),
    printf(
        (info) =>
            `${info.timestamp} [${info.label}]  [${info.level}]  ${formatObject(
                info.message
            )}`
    )
);

// 콘솔에 찍힐 때는 색깔을 구변해서 로깅해주자.
const consoleOpts = {
    handleExceptions: true,
    level: level(),
    format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" })
    ),
};

const transports = [
    // 콘솔로그찍을 때만 색넣자.
    new winston.transports.Console(consoleOpts),
    // error 레벨 로그를 저장할 파일 설정
    new WinstonDaily({
        level: "error",
        datePattern: "YYYY-MM-DD",
        dirname: path.join(logPath, "/app-error"),
        filename: "%DATE%_error.log",
        maxFiles: 30,
        zippedArchive: true,
    }),
    // 모든 레벨 로그를 저장할 파일 설정
    new WinstonDaily({
        level: "debug",
        datePattern: "YYYY-MM-DD",
        dirname: path.join(logPath, "/app"),
        filename: "%DATE%_all.log",
        maxFiles: 7,
        zippedArchive: true,
    }),
];

const appendTimestamp = winston.format((info, opts) => {
    if (opts.tz)
        info.timestamp = moment()
            .tz(opts.tz)
            .format(" YYYY-MM-DD HH:mm:ss.SSS ||");
    return info;
});

const logger = winston.createLogger({
    level: level(),
    levels,
    format: logFormat,
    transports,
});

module.exports = logger;
