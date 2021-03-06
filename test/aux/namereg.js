/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var utils = require("../../src/utilities");
var augur = utils.setup(require("../../src"), process.argv.slice(2));
var constants = augur.constants;
var log = console.log;

// create random handle and password
var handle = utils.sha256(new Date().toString()).slice(0, 24);
var password = utils.sha256(Math.random().toString(36).substring(4)).slice(0, 24);
var newAccountAddress;

describe("namereg.reserve", function () {

    it("should reserve name 'jack' for coinbase", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.reserve("jack",
            function (r) {
                // sent
                assert(r.txHash);
                assert.strictEqual(r.callReturn, null);
            },
            function (r) {
                // success
                assert(r.txHash);
                assert(r.blockHash);
                assert(r.blockNumber);
                assert.strictEqual(r.from, augur.coinbase);
                assert.strictEqual(r.to, augur.contracts.namereg);
                assert.strictEqual(r.callReturn, null);
                done();
            },
            function (r) {
                // failed
                done(r);
            }
        )
    });

    it("should reserve name 'zombiejack' for coinbase", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.reserve("zombiejack",
            function (r) {
                // sent
                assert(r.txHash);
                assert.strictEqual(r.callReturn, null);
            },
            function (r) {
                // success
                assert(r.txHash);
                assert(r.blockHash);
                assert(r.blockNumber);
                assert.strictEqual(r.from, augur.coinbase);
                assert.strictEqual(r.to, augur.contracts.namereg);
                assert.strictEqual(r.callReturn, null);
                done();
            },
            function (r) {
                // failed
                done(r);
            }
        )
    });

    it("create and fund web account", function (done) {
        var amount = 64;
        this.timeout(constants.TIMEOUT);
        log(handle, password);
        augur.web.register(handle, password, function (toAccount) {
            assert(!toAccount.error);
            assert.property(toAccount, "nonce");
            assert(toAccount.privateKey);
            assert(toAccount.address);
            assert.strictEqual(toAccount.handle, handle);
            newAccountAddress = toAccount.address;
            log("registered:", toAccount);
            augur.sendEther(
                toAccount.address,
                amount,
                augur.coinbase,
                function (r) {
                    // sent
                    log(r);
                    assert.property(r, "txHash");
                    assert.property(r, "callReturn");
                },
                function (r) {
                    log(r);
                    done();
                },
                function (r) {
                    done(r);
                }
            );
        });
    });

    it("reserve 'tinybike' for web account", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.web.login(handle, password, function (account) {
            assert.strictEqual(account.handle, handle);
            augur.namereg.reserve("tinybike",
                function (r) {
                    // sent
                    assert(r.txHash);
                    assert.strictEqual(r.callReturn, null);
                },
                function (r) {
                    // success
                    assert(r.txHash);
                    assert(r.blockHash);
                    assert(r.blockNumber);
                    assert.strictEqual(r.from, account.address);
                    assert.strictEqual(r.to, augur.contracts.namereg);
                    assert.strictEqual(r.callReturn, null);
                    augur.web.logout();
                    done();
                },
                function (r) {
                    // failed
                    done(r);
                }
            )
        });
    });

});

describe("namereg.owner", function () {

    it("should report that coinbase owns 'jack'", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.owner("jack", function (address) {
            if (address.error) return done(address);
            assert.strictEqual(address, augur.coinbase);
            done();
        });
    });

    it("should report that the web account owns 'tinybike'", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.owner("tinybike", function (address) {
            log(address);
            assert.strictEqual(address, newAccountAddress);
            done();
        });
    });

});

describe("namereg.setAddress", function () {

    it("should set address for 'jack' to coinbase", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.setAddress("jack", augur.coinbase, true,
            function (r) {
                // sent
                log(r);
                assert(r.txHash);
                assert.strictEqual(r.callReturn, null);
            },
            function (r) {
                // success
                log(r);
                assert(r.txHash);
                assert.strictEqual(r.callReturn, null);
                assert(r.blockHash);
                assert(r.blockNumber);
                assert.strictEqual(r.from, augur.coinbase);
                assert.strictEqual(r.to, augur.contracts.namereg);
                done();
            },
            function (r) {
                // failed
                done(r);
            }
        );
    });

    it("should set address for 'tinybike' to web account", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.web.login(handle, password, function (account) {
            augur.namereg.setAddress("tinybike", account.address, true,
                function (r) {
                    // sent
                    assert(r.txHash);
                    assert.strictEqual(r.callReturn, null);
                },
                function (r) {
                    // success
                    assert(r.txHash);
                    assert(r.blockHash);
                    assert(r.blockNumber);
                    assert.strictEqual(r.from, account.address);
                    assert.strictEqual(r.to, augur.contracts.namereg);
                    assert.strictEqual(r.callReturn, null);
                    done();
                },
                function (r) {
                    // failed
                    done(r);
                }
            );
        });
    });

});

describe("namereg.addr", function () {

    it("should get coinbase from name 'jack'", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.addr("jack", function (address) {
            log(address);
            done();
        });
    });

});

describe("namereg.name", function () {

    it("should get 'jack' from coinbase address", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.name(augur.coinbase, function (name) {
            log(name);
            done();
        });
    });

});

describe("namereg.transfer", function () {

    it("should transfer 'jack' from coinbase to web account", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.transfer("jack", newAccountAddress,
            function (r) {
                // sent
                assert(r.txHash);
                assert.strictEqual(r.callReturn, null);
            },
            function (r) {
                // success
                assert(r.txHash);
                assert(r.blockHash);
                assert(r.blockNumber);
                assert.strictEqual(r.from, augur.coinbase);
                assert.strictEqual(r.to, augur.contracts.namereg);
                assert.strictEqual(r.callReturn, null);
                done();
            },
            function (r) {
                // failed
                done(r);
            }
        );
    });

});

describe("namereg.disown", function () {

    it("should remove ownership of 'zombiejack' from coinbase", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.namereg.disown("zombiejack",
            function (r) {
                // sent
                assert(r.txHash);
                assert.strictEqual(r.callReturn, null);
            },
            function (r) {
                // success
                assert(r.txHash);
                assert(r.blockHash);
                assert(r.blockNumber);
                assert.strictEqual(r.from, augur.coinbase);
                assert.strictEqual(r.to, augur.contracts.namereg);
                assert.strictEqual(r.callReturn, null);
                done();
            },
            function (r) {
                // failed
                done(r);
            }
        );
    });

});
