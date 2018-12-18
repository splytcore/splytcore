'use strict';

describe('Dashboards E2E Tests:', function () {
  describe('Test Dashboards page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/dashboards');
      expect(element.all(by.repeater('dashboard in dashboards')).count()).toEqual(0);
    });
  });
});
