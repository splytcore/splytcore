'use strict';

describe('Sellers E2E Tests:', function () {
  describe('Test Sellers page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/sellers');
      expect(element.all(by.repeater('seller in sellers')).count()).toEqual(0);
    });
  });
});
