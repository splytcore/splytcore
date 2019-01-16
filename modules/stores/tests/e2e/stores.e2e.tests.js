'use strict';

describe('Stores E2E Tests:', function () {
  describe('Test Stores page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/stores');
      expect(element.all(by.repeater('store in stores')).count()).toEqual(0);
    });
  });
});
