var async = require('async'),
    npm = require('npm');

exports = module.exports = NpmRetryInstall;

function NpmRetryInstall(options) {
  options = options || {};
};

NpmRetryInstall.getMissing = function(path, cb){
  npm.load(function(err){
    if (err) throw err;
    npm.commands.outdated(function(err, data){
      if (err) throw err;
      var missing_modules = [];
      data.forEach(function(module){
        if(module[2] === undefined)
          missing_modules.push([module[1], module[3]]);
      });
      cb(missing_modules);
    });
  });
};

NpmRetryInstall.installModule = function(module, cb){
  npm.load(function(err){
    if (err) throw err;
    npm.commands.install([module[0] + '@' + module[1]], function(err, data){
      if (err) throw err;
      cb(data);
    });
  });
};

NpmRetryInstall.init = function(cb){
  var msg = [];
  NpmRetryInstall.getMissing(process.cwd(), function(data){
    if(data.length > 0){
      msg.push('The following modules are missing and will be installed:');
      
      async.map(data, NpmRetryInstall.installModule, function(err, result){
        return cb(result);
      });
    } else {
      cb('No modules seem to be missing.  Huzzah!');
    }
  });
};