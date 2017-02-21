module.exports = function(grunt) {

	var nodeModules = Object.keys(require('./package.json')['dependencies']);
	var nodeModulePaths = nodeModules.map(function(name) {
		return './node_modules/' + name + '/**'
	});
	
	// project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compress: {
			main: {
				options: {
					archive: '../dist/skill-nodejs-werder-city-guide.zip'
				},
				files: [
					{ src: ['index.js'] },
					{ src: ['package.json'] },
					{ src: ['node_modules/**'] }
				]
			}
		},
		lambda_deploy: {
			default: {
				arn: 'arn:aws:lambda:eu-west-1:662991220151:function:werderCityGuide',
				options: {
					timeout: 10,
					memory: 128,
					region: 'eu-west-1'
				}
			}
		},
		lambda_package: {
			default: {
				options: {
					dist_folder: '../dist'
				}
			}
		}
    });
	
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-aws-lambda');
		
	grunt.registerTask('default', ['compress']);
	grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
};