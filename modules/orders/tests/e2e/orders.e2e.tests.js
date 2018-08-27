'use strict';

describe('Orders E2E Tests:', function () {
  describe('Test Orders page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/orders');
      expect(element.all(by.repeater('order in orders')).count()).toEqual(0);
    });
  });
});
