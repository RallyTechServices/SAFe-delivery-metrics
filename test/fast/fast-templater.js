var template = './test/fast/custom.tmpl';

exports.process = function(grunt, task, context) {

    var source = grunt.file.read(template);
    return grunt.util._.template(source, context);

};
