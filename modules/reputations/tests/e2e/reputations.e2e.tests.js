'use strict';

describe('Reputations E2E Tests:', function () {
  describe('Test Reputations page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/reputations');
      expect(element.all(by.repeater('reputation in reputations')).count()).toEqual(0);
    });
  });
});
