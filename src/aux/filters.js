/**
 * Ethereum filters / logging
 */

"use strict";

var chalk = require("chalk");
var abi = require("augur-abi");
var log = console.log;

module.exports = function (augur) {

    return {

        price_filters: {
            updatePrice: null,
            pricePaid: null,
            priceSold: null
        },

        eth_newFilter: function (params, f) {
            return augur.rpc.broadcast(augur.rpc.marshal("newFilter", params), f);
        },

        create_price_filter: function (label, f) {
            return this.eth_newFilter({ topics: [ label ]}, f);
        },

        eth_getFilterChanges: function (filter, f) {
            return augur.rpc.broadcast(augur.rpc.marshal("getFilterChanges", filter), f);
        },

        eth_getFilterLogs: function (filter, f) {
            return augur.rpc.broadcast(augur.rpc.marshal("getFilterLogs", filter), f);
        },

        eth_getLogs: function (filter, f) {
            return augur.rpc.broadcast(augur.rpc.marshal("getLogs", filter), f);
        },

        eth_uninstallFilter: function (filter, f) {
            return augur.rpc.broadcast(augur.rpc.marshal("uninstallFilter", filter), f);
        },

        search_price_logs: function (logs, market_id, outcome_id) {
            // array response: user, market, outcome, price
            var parsed, unfix_type, price_logs;
            if (logs) {
                unfix_type = (augur.bignumbers) ? "BigNumber" : "string";
                price_logs = [];
                for (var i = 0, len = logs.length; i < len; ++i) {
                    parsed = augur.rpc.parse_array(logs[i].data);
                    if (abi.bignum(parsed[1]).eq(abi.bignum(market_id)) &&
                        abi.bignum(parsed[2]).eq(abi.bignum(outcome_id))) {
                        if (augur.bignumbers) {
                            price_logs.push({
                                price: abi.unfix(parsed[3], unfix_type),
                                blockNumber: abi.bignum(logs[i].blockNumber)
                            });
                        } else {
                            price_logs.push({
                                price: abi.unfix(parsed[3], unfix_type),
                                blockNumber: logs[i].blockNumber
                            });
                        }
                    }
                }
                return price_logs;
            }
        },

        poll_eth_listener: function (filter_name, onMessage) {
            if (this.price_filters[filter_name]) {
                var filterId = this.price_filters[filter_name].filterId;
                this.eth_getFilterChanges(filterId, function (message) {
                    if (message) {
                        var num_messages = message.length;
                        log(message);
                        if (num_messages) {
                            for (var i = 0; i < num_messages; ++i) {
                                var data_array = this.parse_array(message[i].data);
                                var unfix_type = (this.bignumbers) ? "BigNumber" : "string";
                                onMessage({
                                    origin: data_array[0],
                                    marketId: data_array[1],
                                    outcome: abi.bignum(data_array[2], unfix_type),
                                    price: abi.unfix(data_array[3], unfix_type)
                                });
                            }
                        }
                    }
                });
            }
        },

        start_eth_listener: function (filter_name, callback) {
            var filter_id;
            if (this.price_filters[filter_name] &&
                this.price_filters[filter_name].filterId) {
                filter_id = this.price_filters[filter_name].filterId;
                log(filter_name + " filter found:", chalk.green(filter_id));
            } else {
                filter_id = this.create_price_filter(filter_name);
                if (filter_id && filter_id !== "0x") {
                    log("Create " + filter_name + " filter:", chalk.green(filter_id));
                    this.price_filters[filter_name] = {
                        filterId: filter_id,
                        polling: false
                    };
                    if (callback) callback(filter_id);
                } else {
                    log("Couldn't create " + filter_name + " filter:",
                        chalk.green(filter_id));
                }
            }
        }

    };
};
