'use strict';

describe('Shopifies E2E Tests:', function () {
  describe('Test Shopifies page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/shopifies');
      expect(element.all(by.repeater('shopify in shopifies')).count()).toEqual(0);
    });
  });
});
