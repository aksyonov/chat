module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            production: {
                options: {
                    paths: ["public/styles"],
                    compress: true,
                    sourceMap: true,
                    sourceMapFilename: "public/all.min.css.map",
                    sourceMapBasepath: 'public'
                },
                files: {
                    "public/all.min.css": "public/styles/all.less"
                }
            }
        },
        processhtml: {
            dist: {
                files: {
                    'public/all.html': ['public/index.html']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.registerTask('default', ["less", "processhtml"]);
};
