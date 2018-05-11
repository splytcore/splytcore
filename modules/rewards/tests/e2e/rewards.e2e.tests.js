'use strict';

describe('Rewards E2E Tests:', function () {
  describe('Test Rewards page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/rewards');
      expect(element.all(by.repeater('reward in rewards')).count()).toEqual(0);
    });
  });
});
