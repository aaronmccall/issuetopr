
exports.clone = function (obj) {
    var result = {};
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
    }
    return result;
};

exports.execHandler = function (fn, next) {
    return function (err, stdout, stderr) {
        if (err) return next(err + '\n' + stderr.toString());
        var result = stdout.toString();
        fn(result, next);
    };
};

exports.extractRepoPath = function (repo) {
    if (repo.indexOf('/') > -1) {
        repo = repo.split('/').slice(-2).join('/');
    } else {
        return '';
    }

    if (repo && repo.indexOf('.git') > -1) {
        repo = repo.replace('.git', '').trim();
    }
    return repo.match(/^[\w\-\.]+\/[\w\-\.]+$/) ? repo : '';
};