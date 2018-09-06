'use strict';

describe('Arbitrations E2E Tests:', function () {
  describe('Test Arbitrations page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/arbitrations');
      expect(element.all(by.repeater('arbitration in arbitrations')).count()).toEqual(0);
    });
  });
});
