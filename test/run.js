var assert = require('assert'),
    npm_install_missing = require('../index.js');

describe('npm-install-missing', function(){
  describe('#getMissing()', function(){
    it('should get a list of the missing modules', function(){
      assert.equal(npm_install_missing.getMissing(), '');
    });
  });
});