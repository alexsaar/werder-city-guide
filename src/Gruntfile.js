module.exports = function(grunt) {

	// project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compress: {
			main: {
				options: {
					archive: '../skill-nodejs-werder-city-guide.zip'
				},
				files: [
					{ src: ['index.js'] },
					{ src: ['package.json'] },
					{ src: ['node_modules/**'] }
				]
			}
		}
    });
	
	grunt.loadNpmTasks('grunt-contrib-compress');
	
	grunt.registerTask('default', ['compress']);
};