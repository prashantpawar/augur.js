/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var chalk = require("chalk");
var assert = require("chai").assert;
var augur = require("../../src");
var constants = require("../../src/constants");
var utilities = require("../../src/utilities");
var log = console.log;

require('it-each')({ testPerIteration: true });

augur = utilities.setup(augur, process.argv.slice(2));

var TIMEOUT = 120000;
var branch = augur.branches.dev;
var period = augur.getVotePeriod(branch);

var reporters = utilities.get_test_accounts(augur, constants.MAX_TEST_ACCOUNTS);

describe("Set ballots for " + reporters.length + " reporters", function () {

    var period = augur.getVotePeriod(branch);
    var num_events = augur.getNumberEvents(branch, period);
    var events = augur.getEvents(branch, period);

    it("setReporterBallot: " + reporters[0], function (done) {
        var i, ballot, reputation;
        this.timeout(TIMEOUT);
        ballot = new Array(num_events);
        for (i = 0; i < num_events; ++i) {
            ballot[i] = 2.0;
        }
        ballot[num_events-3] = 1.0;
        log("     ", chalk.cyan(JSON.stringify(ballot)));
        reputation = augur.getRepBalance(branch, reporters[0]);
        assert.strictEqual(augur.getReporterID(branch, 0), reporters[0]);
        augur.setReporterBallot(
            branch,
            period,
            reporters[0],
            ballot,
            reputation,
            function (r) {
                // sent
            },
            function (r) {
                // success
                assert.strictEqual(r.callReturn, "1");
                done();
            },
            function (r) {
                // failed
                r.name = r.error; throw r;
                done();
            }
        );
    });

    it("setReporterBallot: " + reporters[1], function (done) {
        var i, ballot, reputation;
        this.timeout(TIMEOUT);
        ballot = new Array(num_events);
        for (i = 0; i < num_events; ++i) {
            ballot[i] = 0.0;
            // ballot[i] = 2.0;
        }
        // ballot[num_events-1] = 1.0;
        // ballot[num_events-2] = 1.0;
        // ballot[num_events-3] = 1.0;
        log("     ", chalk.cyan(JSON.stringify(ballot)));
        reputation = augur.getRepBalance(branch, reporters[1]);
        assert.strictEqual(augur.getReporterID(branch, 1), reporters[1]);
        augur.setReporterBallot(
            branch,
            period,
            reporters[1],
            ballot,
            reputation,
            function (r) {
                // sent
            },
            function (r) {
                // success
                assert.strictEqual(r.callReturn, "1");
                done();
            },
            function (r) {
                // failed
                r.name = r.error; throw r;
                done();
            }
        );
    });

    it("setReporterBallot: " + reporters[2], function (done) {
        var i, ballot, reputation;
        this.timeout(TIMEOUT);
        ballot = new Array(num_events);
        for (i = 0; i < num_events; ++i) {
            ballot[i] = 2.0;
        }
        // ballot[num_events-1] = 0.0;
        // ballot[num_events-2] = 0.0;
        ballot[num_events-1] = 1.0;
        ballot[num_events-2] = 1.0;
        ballot[num_events-3] = 1.0;
        log("     ", chalk.cyan(JSON.stringify(ballot)));
        reputation = augur.getRepBalance(branch, reporters[2]);
        assert.strictEqual(augur.getReporterID(branch, 2), reporters[2]);
        augur.setReporterBallot(
            branch,
            period,
            reporters[2],
            ballot,
            reputation,
            function (r) {
                // sent
            },
            function (r) {
                // success
                assert.strictEqual(r.callReturn, "1");
                done();
            },
            function (r) {
                // failed
                r.name = r.error; throw r;
                done();
            }
        );
    });

    it.each(reporters.slice(3), "setReporterBallot: %s", ['element'], function (element, next) {
        var i, ballot, reputation;
        this.timeout(TIMEOUT);
        ballot = new Array(num_events);
        for (i = 0; i < num_events; ++i) {
            ballot[i] = 0.0;
        }
        log("     ", chalk.cyan(JSON.stringify(ballot)));
        reputation = augur.getRepBalance(branch, element);
        augur.setReporterBallot(
            branch,
            period,
            element,
            ballot,
            reputation,
            function (r) {
                // sent
            },
            function (r) {
                // success
                assert.strictEqual(r.callReturn, "1");
                next();
            },
            function (r) {
                // failed
                r.name = r.error; throw r;
                next();
            }
        );
    });
});
