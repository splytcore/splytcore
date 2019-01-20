'use strict';

describe('Carts E2E Tests:', function () {
  describe('Test Carts page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/carts');
      expect(element.all(by.repeater('cart in carts')).count()).toEqual(0);
    });
  });
});
