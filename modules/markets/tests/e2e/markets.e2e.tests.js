'use strict';

describe('Markets E2E Tests:', function () {
  describe('Test Markets page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/markets');
      expect(element.all(by.repeater('market in markets')).count()).toEqual(0);
    });
  });
});
