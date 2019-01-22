'use strict';

describe('Stripes E2E Tests:', function () {
  describe('Test Stripes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/stripes');
      expect(element.all(by.repeater('stripe in stripes')).count()).toEqual(0);
    });
  });
});
