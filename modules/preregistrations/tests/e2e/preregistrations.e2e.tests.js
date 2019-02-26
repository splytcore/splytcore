'use strict';

describe('Preregistrations E2E Tests:', function () {
  describe('Test Preregistrations page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/preregistrations');
      expect(element.all(by.repeater('preregistration in preregistrations')).count()).toEqual(0);
    });
  });
});
