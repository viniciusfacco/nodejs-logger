const path = require('path');
const stack = require('stack-trace');
const os = require("os");
const { format, createLogger, transports } = require('winston');
const { timestamp, combine, errors, printf, json } = format;
const SplunkTransport = require('./splunk-transport')

const LOG_LEVEL = 'debug';
const SPLUNK_LOG_INDEX = 'index';
const SPLUNK_LOG_HOST = '127.0.0.1';
const SPLUNK_LOG_PORT = '8089';
const SPLUNK_LOG_PATH = '/services/collector/event';
const SPLUNK_LOG_AUTH = 'token';
const SPLUNK_LOG_SOURCETYPE = 'sourcetype';
const SPLUNK_LOG_SOURCE = 'source';

class MessageLogger{    

    constructor(){

        this.consoleFormat = printf(({ timestamp, level, message }) => {
            return `time:${timestamp}, level:${level.toUpperCase()}, ${message}`;
        });
        
        this.httpFormat = printf(({ host, source, sourcetype, index, file, method, line, level, message }) => {
            return `{"host":"${host}", "source":"${source}", "sourcetype":"${sourcetype}", "index":"${index}", "event":{"file":"${file}", "method":"${method}", "line":"${line}", "severity":"${level.toUpperCase()}", "message": "${message}"}}`;
        });

        this.consolelogger = createLogger({
            level: LOG_LEVEL,
            defaultMeta: { 
                host: os.hostname(), 
                source: SPLUNK_LOG_SOURCE,
                sourcetype: SPLUNK_LOG_SOURCETYPE,
                index: SPLUNK_LOG_INDEX,
                file: 'file',
                method: 'method',
                line: 'line'
            },
            transports: [
                new transports.Console({
                    format: combine(
                        timestamp(),
                        format.simple(), 
                        this.consoleFormat
                    )
                })
            ],    
        });

        this.splunklogger = createLogger({
            level: LOG_LEVEL,            
            defaultMeta: { 
                host: os.hostname(), 
                source: SPLUNK_LOG_SOURCE,
                sourcetype: SPLUNK_LOG_SOURCETYPE,
                index: SPLUNK_LOG_INDEX,
                file: 'file',
                method: 'method',
                line: 'line'
            },
            transports: [
                new transports.Console({
                    format: combine(
                        timestamp(),
                        format.simple(), 
                        this.consoleFormat
                    )
                }),
                new SplunkTransport({
                    format: combine(this.httpFormat),
                    host: SPLUNK_LOG_HOST,
                    port: SPLUNK_LOG_PORT,
                    path: SPLUNK_LOG_PATH,
                    auth: SPLUNK_LOG_AUTH
                })
                //new transports.Console({
                //    format: combine(this.httpFormat)
                //})
            ],    
        });
    }

    getMetadata(){
        var caller_file = path.basename(stack.get()[2].getFileName())
        var caller_method = stack.get()[2].getFunctionName()
        var caller_line= stack.get()[2].getLineNumber()
        return {file: caller_file, method: caller_method, line: caller_line}
    }

    //methods to generate the logs
    error(event, store = true){    
        var metadata = this.getMetadata()
        if (store) {
            this.splunklogger.error(event, metadata)
        } else {
            this.consolelogger.error(event, metadata)
        }
    }

    warning(event, store = true){
        var metadata = this.getMetadata()
        if (store) {
            this.splunklogger.warn(event, metadata)
        } else {
            this.consolelogger.warn(event, metadata)
        }
    }

    warn(event, store = true){
        var metadata = this.getMetadata()
        if (store) {
            this.splunklogger.warn(event, metadata)
        } else {
            this.consolelogger.warn(event, metadata)
        }
    }

    info(event, store = true){
        var metadata = this.getMetadata()
        console.log(metadata)
        if (store) {
            this.splunklogger.info(event, metadata)
        } else {
            this.consolelogger.info(event, metadata)
        }
    }

    debug(event, store = true){
        var metadata = this.getMetadata()
        if (store) {
            this.splunklogger.debug(event, metadata)
        } else {
            this.consolelogger.debug(event, metadata)
        }
    }    
}

module.exports = new MessageLogger();