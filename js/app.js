(function (window) {
	'use strict';

	can.fixture({
		"GET /services/todos": function () {
			return [
				{name: 'Walk the dog', completed: true, id: 1},
				{name: 'Mow the lawn', completed: false, id: 2},
				{name: 'Learn canjs', completed: false, id: 3}
			];
		},
		"DELETE /services/todos/{id}": function () {
			return {};

		},
		"POST /services/todos": function () {
			console.log('you just created a todo');
			return {id: Math.random()}
		},
		"PUT /services/todos/{id}": function () {
			console.log('you updated a todo on the server!');
			return {};
		}
	});

	var Todo = can.Model.extend({
		findAll: "GET /services/todos",
		destroy: "DELETE /services/todos/{id}",
		create: "POST /services/todos",
		update: "PUT /services/todos/{id}"
	}, {});

	window.Todo = Todo;

	Todo.List = Todo.List.extend({
		filter: function (check) {
			var list = new this.constructor;
			this.each(function (todo) {
				if (check(todo)) {
					list.push(todo);
				}

			});
			return list
		},
		active: function () {
			return this.filter(function (todo) {
				return !todo.attr('completed');
			})
		},
		completed: function () {
			return this.filter(function (todo) {
				return todo.attr('completed');
			})
		},
		activeCount: function () {
			return this.active().attr('length');
		},
		completedCount: function () {
			return this.completed().attr('length');
		}
	});

	can.Component.extend({
		tag: "todos-create",
		template: "<input class='new-todo' id='new-todo' placeholder='what needs to be done?' autofocus='' " +
		"can-enter='createTodo'>",
		scope: {
			createTodo: function (context, el, ev) {
				if (el.val()) {
					new Todo({
						completed: false,
						name: el.val()
					}).save();
					el.val('');
				}
			}
		}
	});

	can.Component.extend({
		tag: 'todos-list',
		template: can.view({url: 'list-template.html', engine: 'mustache'}),
		scope: {
			"editTodo": function (todo) {
				todo.attr("editing", true);
			},
			"updateTodo": function (todo, el) {
				todo.removeAttr('editing');
				todo.attr('name', el.val());
				todo.save();
			}
		}
	});

	can.Component.extend({
		tag: 'todos-app',
		scope: {
			todos: new Todo.List({}),
			displayedTodos: function () {
				var filter = can.route.attr('filter');
				var todos = this.attr('todos');

				if (filter === 'active') {
					return todos.active();
				} else if (filter === 'completed') {
					return todos.completed();
				}

				return todos;
			}
		},
		helpers: {
			filterLink: function (text, filterValue) {
				var attrs = {};
				if (filterValue) {
					attrs.filter = filterValue;
				}
				return can.route.link(text, attrs, {
					className: can.route.attr('filter') == filterValue ? "selected" : ""
				});
			},
			plural: function (singular, count) {
				var value = count()();
				if (value == 1) {
					return singular;
				} else {
					return singular + 's';
				}
			}
		},
		events: {
			"{Todo} created": function (Todo, ev, newTodo) {
				console.log('event created');
				this.scope.attr('todos').push(newTodo);
			}
		}
	});

	can.route(':filter');
	can.route.ready();

	var frag = can.view({
		url: "app-template.html", engine: "mustache"
	}, {});

	$('#app').html(frag);


})(window);
