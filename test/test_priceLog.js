/**
 * price logging/filter tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var chalk = require("chalk");
var Augur = require("../augur");

Augur.connect();

var log = console.log;
var TIMEOUT = 24000;

var branch = Augur.branches.dev;
var markets = Augur.getMarkets(branch);
var market_id = markets[markets.length - 1];
var outcome = "2";
var amount = "10";

describe("updatePrice listener", function () {
    it("should return data on buyShares", function (done) {
        this.timeout(TIMEOUT);
        Augur.start_eth_listener("updatePrice", function (filter_id) {
            var listener = setInterval(function () {
                Augur.poll_eth_listener("updatePrice", function (data) {
                    if (data) {
                        log(data);
                        clearInterval(listener);
                        done();
                    }
                });
            }, 2000);
            setTimeout(function () {
                Augur.buyShares({
                    branchId: branch,
                    marketId: market_id,
                    outcome: outcome,
                    amount: amount,
                    onSent: function (r) {

                    },
                    onSuccess: function (r) {
                        log(r);
                    },
                    onFailed: function (r) {
                        throw(r.message);
                    }
                });
            }, 2000);
        });
    });
});

// var log = console.log;

// var branch = Augur.branches.dev;
// var markets = Augur.getMarkets(branch);

// var args = process.argv.slice(2);
// var market_id;
// if (args[0]) {
//     market_id = args[0];
// } else {
//     market_id = markets[markets.length - 1];
// }
// var events = Augur.getMarketEvents(market_id);
// var event_id = events[0];
// var outcome = "1.0";
// var price = Augur.price(market_id, outcome);
// var cost = Augur.getSimulatedBuy(market_id, outcome, amount);
// var initial_cash = Augur.getCashBalance(Augur.coinbase);
// var initial_rep = Augur.getRepBalance(branch, Augur.coinbase);
// var initial_ether = Augur.bignum(Augur.balance(Augur.coinbase)).dividedBy(Augur.ETHER).toFixed();
// var amount = "100";

// log(chalk.cyan("Initial balances:"));
// log("CASH:    " + chalk.green(initial_cash));
// log("REP:     " + chalk.green(initial_rep));
// log("ETHER:   " + chalk.green(initial_ether));

// log(chalk.cyan("\nSubmit trade:"));
// log("Market:  " + chalk.green(market_id));
// log("Event:   " + chalk.green(event_id));
// log("Outcome: " + chalk.green(outcome));
// log("Buy:     " + chalk.green(amount) + chalk.gray(" shares"));
// log("Price:   " + chalk.green(Augur.bignum(price).toFixed()) + chalk.gray(" CASH/share"));
// log("Cost:    " + chalk.green(Augur.fix(cost, "string")) + chalk.gray(" CASH"));

// Augur.buyShares({
//     branchId: branch,
//     marketId: market_id,
//     outcome: outcome,
//     amount: amount,
//     onSent: function (r) {
//         log(chalk.cyan("\nResponse:"));
//         log("txhash: ", chalk.green(r.txHash));
//         log("return: ", chalk.green(Augur.unfix(r.callReturn, "string")));
//     },
//     onSuccess: function (r) {
//         var final_cash = Augur.getCashBalance(Augur.coinbase);
//         var final_rep = Augur.getRepBalance(branch, Augur.coinbase);
//         var final_ether = Augur.bignum(Augur.balance(Augur.coinbase)).dividedBy(Augur.ETHER).toFixed();
//         log(chalk.cyan("\nFinal balances:"));
//         log("CASH:   ", chalk.green(final_cash));
//         log("REP:    ", chalk.green(final_rep));
//         log("ETHER:  ", chalk.green(final_ether));
//     },
//     onFailed: function (r) {
//         throw(r.message);
//     }
// });