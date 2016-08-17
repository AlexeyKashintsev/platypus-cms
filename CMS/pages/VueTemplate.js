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
		components: {
			'test2': {
			    template:'<div style="width:80px; heidht: 80px; background-color: red"; display: inline-block;>{{name}}</div>',
			    data: function() {
			        return {
			            name:'вывод 2 вид 2',
			        }
			    },
			},
			'test1': {
			    template:'{{name}}',
			    data: function() {
			        return {
			            name:'вывод 1 вид 1',
			        }
			    },
			},} 
	});
});
