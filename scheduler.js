/**
 * Created by br006093 on 2/7/2018.
 * ------------------------------------------------------------
 * We basically want to schedule an recurring task at odd hours
 */
let schedule 		= require('node-schedule');
let jobFunctions 	= require('./jobFunctions');
let jobs 			= jobFunctions.jobs;
let runJob 			= jobFunctions.runJob;

const MAX_TIMESTAMP = 8640000000000000;
const MAX_DATE = new Date( MAX_TIMESTAMP );

// Default cron dates
const CRON_RULE_MIDNIGHT = "0 0 0 * * *";
const CRON_RULE_EVERYHOUR = "0 0 * * * *";
const CRON_RULE_EVERYMINUTE = "0 * * * * *";
const CRON_RULE_EVERY30SEC = "*/30 * * * * *";
const CRON_RULE_EVERY15SEC = "*/15 * * * * *";

// JOB Cron times
const CRON_RULE_KRAB_JOB = CRON_RULE_MIDNIGHT;
const CRON_RULE_PRICE_JOB = "0 1 0 * * *"; // 12:05 am
const CRON_RULE_ASSET_JOB = "0 5 0 * * *"; // 12:10 am

/* setTimeout(function(){
	runJob.bind( null, 'krabingJob', jobs.krabingImport )();
}, 4000);*/

let krabingJOB = schedule.scheduleJob({ end: MAX_DATE,  rule: CRON_RULE_MIDNIGHT },
    runJob.bind( null, 'krabingJob', jobs.krabingImport ) );
let priceChecker = schedule.scheduleJob({ end: MAX_DATE, rule: CRON_RULE_PRICE_JOB },
	runJob.bind( null, 'priceImport', jobs.priceImport ) );
let assetJob = schedule.scheduleJob({ end: MAX_DATE, rule: CRON_RULE_ASSET_JOB },
	runJob.bind( null, 'assetImport', jobs.assetImport ) );