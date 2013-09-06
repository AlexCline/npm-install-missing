var assert = require('node-assertthat'),
    exec = require('child_process').exec,
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    npm_install_missing = require('../index.js');

var test_dependency = { "express": "" },
    fake_package_json = {
  "name": "npm-install-missing-test",
  "version": "0.0.0",
  "dependencies": test_dependency
},
    working_dir = process.cwd() + "/.tmp",
    missing_mods = [];

describe('npm-install-missing', function(){
  this.timeout(10000);
  before(function(done){
    mkdirp(working_dir, function(err){
      if (err) throw err;
      try {
        process.chdir(working_dir);
        fs.writeFile(working_dir + '/package.json', JSON.stringify(fake_package_json, null, 2), function(err){
          if (err) throw err;
          exec('rm -rf ' + working_dir + '/node_modules', function(err, result){
            if (err) throw err;
            done();
          });
        });
      }
      catch (err) {
        console.log('chdir: ' + err);
      }
    });
  });

  after(function(done){
    exec('rm -rf ' + working_dir, function(err, result){
      if(err) throw err;
      done();
    });
  });

  describe('test setup', function(){
    it('should be in the special working_dir', function(){
      assert.that(process.cwd(), is.equalTo(working_dir));
    });
    it('should have written the fake package.json file', function(done){
      fs.exists(working_dir + '/package.json', function(exists){
        assert.that(exists, is.true());
        done();
      });
    });
    it('should have deleted the node_modules dir from the working_dir', function(done){
      fs.exists(working_dir + '/node_modules', function(exists){
        assert.that(exists, is.false());
        done();
      });
    });
  });

  describe('#getMissing()', function(){
    it('should get a list of the missing modules before anything is installed', function(done){
      npm_install_missing.getMissing(process.cwd(), function(data){
        assert.that(data.length, is.equalTo(1));
        missing_mods = data;
        done();
      });
    });
  });

  describe('#installModule', function(){
    it('should install the test_dependency module', function(done){
      npm_install_missing.installModule(missing_mods[0], function(err, result){
        assert.that(result.length, is.greaterThan(1));
        done();
      });
    });
  });

  describe('make a module go missing', function(){
    it('should successfully delete a dependency of the test_dependency module', function(done){
      exec('rm -rf ' + working_dir + '/node_modules/express/node_modules/connect/node_modules/pause', function(err, result){
        assert.that(err, is.null());
        assert.that(result, is.equalTo(''));
        done();
      });
    });
  });

  describe('#getMissing()', function(){
    it('should get a list of the missing modules after deleting a dependency', function(done){
      npm_install_missing.getMissing(process.cwd(), function(data){
        assert.that(data.length, is.greaterThan(0));
        missing_mods = data;
        done();
      });
    });
  });

  describe('#installModule', function(){
    it('should install the missing module dependency', function(done){
      npm_install_missing.installModule(missing_mods[0], function(err, result){
        assert.that(result[0], is.equalTo('pause'));
        done();
      });
    });
  });

  describe('#getMissing()', function(){
    it('should get a list of the missing modules after installing missing dependencies', function(done){
      npm_install_missing.getMissing(process.cwd(), function(data){
        assert.that(data.length, is.equalTo(0));
        done();
      });
    });
  });

});