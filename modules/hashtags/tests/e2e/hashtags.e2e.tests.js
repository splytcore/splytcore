'use strict';

describe('Hashtags E2E Tests:', function () {
  describe('Test Hashtags page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/hashtags');
      expect(element.all(by.repeater('hashtag in hashtags')).count()).toEqual(0);
    });
  });
});
