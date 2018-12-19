'use strict';

describe('Affiliates E2E Tests:', function () {
  describe('Test Affiliates page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/affiliates');
      expect(element.all(by.repeater('affiliate in affiliates')).count()).toEqual(0);
    });
  });
});
