'use strict';

describe('Analytics E2E Tests:', function () {
  describe('Test Analytics page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/analytics');
      expect(element.all(by.repeater('analytic in analytics')).count()).toEqual(0);
    });
  });
});
