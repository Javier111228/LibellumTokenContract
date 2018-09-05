const { LibellumTestValuesUsing, LIB, Mio } = require("../TestFactory.js");
const { increaseTimeTo, duration } = require('../helpers/increaseTime');
const { expectThrow } = require('../helpers/expectThrow.js');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
    .should();

contract('TokenTimelockBase (1)', function (accounts) {
    beforeEach(async function () {
        this.values = await LibellumTestValuesUsing(accounts);
    });

    it('cannot be released before time limit', async function () {
        await expectThrow(this.values.founderTimelockContract.releaseOn(this.values.libellumTokenContract.address));
    });

    it('cannot be released just before time limit', async function () {
        await increaseTimeTo(this.values.founderTimelockReleaseTime - duration.seconds(3));
        await expectThrow(this.values.founderTimelockContract.releaseOn(this.values.libellumTokenContract.address));
    });
});

contract('TokenTimelockBase (2)', function (accounts) {
    beforeEach(async function () {
        this.values = await LibellumTestValuesUsing(accounts);
    });

    it('can be released just after limit', async function () {
        await increaseTimeTo(this.values.founderTimelockReleaseTime + duration.seconds(1));
        await this.values.founderTimelockContract.releaseOn(this.values.libellumTokenContract.address);
        const balance = await this.values.libellumTokenContract.balanceOf(this.values.founder);
        balance.should.be.bignumber.equal(10 * Mio * LIB);
    });
});

contract('TokenTimelockBase (3)', function (accounts) {
    beforeEach(async function () {
        this.values = await LibellumTestValuesUsing(accounts);
    });

    it('cannot be released twice', async function () {
        await increaseTimeTo(this.values.founderTimelockReleaseTime + duration.hours(1));
        await this.values.founderTimelockContract.releaseOn(this.values.libellumTokenContract.address);
        await expectThrow(this.values.founderTimelockContract.releaseOn(this.values.libellumTokenContract.address));
        const balance = await this.values.libellumTokenContract.balanceOf(this.values.founder);
        balance.should.be.bignumber.equal(10 * Mio * LIB);
    });
});