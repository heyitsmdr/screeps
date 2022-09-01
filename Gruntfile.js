module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: process.env.SCREEPS_EMAIL,
                token: '91e39624-452e-4c58-83b4-d1136628cd6c',
                branch: 'test',
                //server: 'season'
            },
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}
