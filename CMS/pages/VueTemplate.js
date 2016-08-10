require(['environment', 'id', 'resource', 'rpc'], function (F, id, Resource, Rpc) {
    var global = this;
    var Server;
    var SmallImageDirectory;

	F.cacheBust(true);
	new Vue({
		el: '#Page',
		data: {
			name: 'sda'
		},
		components: {		'test3': {   				 			template: '<div style="width:50px; height: 50px; background-color: red;">{{name}}</div>', 				 			data: function() { 					 				return {                          						 				name: 'test3',                      					 				}                  				 			},              			 		},				'test2': {   				template: '{{name}}', 				data: function() { 					return {                          						name: 'вывод 2 вид 2',                      					}                  				},              			},			'test1': {   				template: '{{name}}', 				data: function() { 					return {                          						name: 'вывод 1 вид 1',                      					}                  				},              			},} 
	});
});
