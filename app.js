var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percent = -1;
	};
	
	Expense.prototype.calculatePercent1 = function(totalIncome) {
		
		if(totalIncome > 0){
			this.percent = Math.round( (this.value / totalIncome) * 100);		
		}else {
			this.percent = -1;
		}
			
	};
	
	Expense.prototype.getPercent = function() {
		return this.percent;	
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItem[type].forEach(function(cur) {
			sum += cur.value;
		})
		data.totals[type] = sum;
	};
	
	var data = {
		allItem: {
			exp: [],
			inc: []
		},
		totals: {
			exp:0,
			inc:0
		},
		budget: 0,
		percent: -1
	};
	
	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			
			//[1 2 3 4 5],next ID = 6;
			//Nhung lo delete ID o giua thanh [1 2 4 6],next ID = 7
			// ID = last ID + 1
			
			//Tao moi mot ID
			if(data.allItem[type].length > 0 ) {
				ID = data.allItem[type][data.allItem[type].length - 1].id + 1; 
			} else {
				ID = 0;
			}
			
			//Tao moi mot Item dua vao inc hoac exp
			if(type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if(type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			
			//Va luu tru tai data
			data.allItem[type].push(newItem);
			
			//Return ve gia tri can thiet
			return newItem;
			
		},
		
		deleteItem: function(type, id) {
			var ids,index;
			
			//Method map tra ve mot array moi thay vi forEach loop tung array 
			
			ids = data.allItem[type].map(function(current) {
				return current.id;
			});
			
			//[1 2 5 6 7]
			//Delete gia tri 5
			//tim index cua gia tri 5
			//Roi splice(vi tri muon delete, muon delete bao nhieu lan)
			
			index = ids.indexOf(id);
			
			if(index !== -1) {
				data.allItem[type].splice(index, 1);
			}
			
		},
		
		calculateBudget: function() {
			
			// Tinh toan tong icom va expen
			calculateTotal('exp');
			calculateTotal('inc');
					
			// Tinh toan doanh so: incom - expenses
			data.budget = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' }).format(data.totals.inc - data.totals.exp);
			
			
			// Tinh toan % so doanh thu da chi tra
			if(data.totals.inc > 0) {
				data.percent = Math.round((data.totals.exp / data.totals.inc) * 100);
			}else {
				data.percent = -1;
			}
			
		},
		
		calculatePercent: function() {
			
			data.allItem.exp.forEach(function(cur) {
				cur.calculatePercent1(data.totals.inc);
			});
			
		},
		
		getPercent: function() {
			
			var allPerc = data.allItem.exp.map(function(cur) {
				return cur.getPercent();
			});
			return allPerc;
			
		},
		
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percent: data.percent
			}; 
		},
		
		test: function() {
			console.log(data);
		}
		
		
	};
	
})();



var UIController = (function() {
	
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription:'.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomLabel: '.budget__income--value',
		expenLabel: '.budget__expenses--value',
		percentLabel: '.budget__expenses--percentage',
		container: '.container',
		expenPercent: '.item__percentage',
		dataLabel: '.budget__title--month'

	};
	
	var nodeListForEach = function(list, callback) {
		for(var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
				
	};
	
	return {
		getinput: function() {	
			return {
				type: document.querySelector(DOMstrings.inputType).value, // Gom 2 gia tri inc(+) hoac exp(-)
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
			};	
		},
		
		addListItem: function(obj, type) {
			var html, newHtml,element;
			
			// Tao chuoi HTML placeholder text
			if(type === 'inc'){
				element = DOMstrings.incomContainer;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>'
			}else if(type === 'exp') {
				element = DOMstrings.expensesContainer;
				html ='<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
			}
			 
			// Thay the plaholder text voi some actual data
			newHtml = html.replace('%id%',obj.id);
			newHtml = newHtml.replace('%value%',new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' }).format(obj.value));
			newHtml = newHtml.replace('%description%',obj.description);
			
			// Insert chuoi HTML vao DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
			
		},
		
		deleteListItem: function(selectorID) {
			
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		
		clearField: function() {
			var fields,fieldsArr;
			
			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
			
			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array) {
				current.value = '';
			})
			
			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomLabel).textContent = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' }).format(obj.totalInc);
			
			document.querySelector(DOMstrings.expenLabel).textContent = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' }).format(obj.totalExp);
			
			if(obj.percent > 0) {
				document.querySelector(DOMstrings.percentLabel).textContent = obj.percent + '%'; 
			}else {
				document.querySelector(DOMstrings.percentLabel).textContent = '---';
			}
			
		},
		
		displayPercent: function(percent) {
			
			var fields = document.querySelectorAll(DOMstrings.expenPercent);
			
			var nodeListForEach = function(list, callback) {
				for(var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
				
			};
			
			nodeListForEach(fields, function(current, index) {
				
				if (percent[index] > 0) {
					current.textContent = percent[index] + '%';
				}else {
					current.textContent = '----';
				}
						
			});
		
		},
		
		displayMonth: function() {
			var now,year,month,months;
			
			now = new Date();
			months = ['Một','Hai','Ba','Bốn','Năm','Sáu','Bảy','Tám','Chín','Mười','Mười Một','Mười Hai']
			
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ' ' + year;
			
		},
		
		changedType: function() {
			
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
			);
			
			 nodeListForEach(fields, function(cur) {
				 cur.classList.toggle('red-focus');
			 });
			
			document.querySelector(DOMstrings.inputButton).classList.toggle('red');
			
		},
		
		getDOMstrings: function() {
			return DOMstrings;
		}
	}
	
})();

var controller = (function(budgetCtrl,UICtrl) {
	
	var setupEventLi = function() {
		var DOM = UIController.getDOMstrings();
		
		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
		
		document.addEventListener('keypress',function(event) {	
			if(event.keyCode === 13 || event.which === 13) {
				ctrlAddItem()
			}	
		});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	}
	
	var updateBudget = function() {
		
		//1. Tinh Toan Budget
		budgetCtrl.calculateBudget();
		
		
		//2.Return Budget
		var budget = budgetCtrl.getBudget();
		
		//3.Hien thi Budget tren UI
		UICtrl.displayBudget(budget);
		
	};
	
	var updatePercentages = function() {
		
		//1. Tinh %
		budgetCtrl.calculatePercent();
		
		//2 Read % tu budgetCtrl
		var percent = budgetCtrl.getPercent();
		
		//3.Upload len UI
		UICtrl.displayPercent(percent);
		
	};
	
	var ctrlAddItem = function() {
		var input,newItem;
		
		// 1.Lay du lieu tu input date
		input = UICtrl.getinput();
		
		if(input.description !== '' && !isNaN(input.value) && input.value > 0)
			{
				// 2.Add Item toi budgetController
				newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		
				// 3.Hien Item len UI
				UICtrl.addListItem(newItem, input.type);
		
				// 4.Lam sach field
				UICtrl.clearField();
		
				// 5.Tinh toan va update len UI budget
				updateBudget();
				
				// 6.Tinh toan va update %
				updatePercentages();
			}
	}
	
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
			
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID) {
			
			// Cat chuoi ItemID
			splitID = itemID.split('-')
			type = splitID[0];
			ID = parseInt(splitID[1]); 
			
			//1.Delete Item tu data structure
			budgetCtrl.deleteItem(type, ID);
			
			//2.Delte Item tu UI
			UICtrl.deleteListItem(itemID);
			
			//3.Update va show tren UI
			updateBudget();
			
			// 4.Tinh toan va update %
			updatePercentages();
			
		}
		
	};
	
	return {
		init: function() {
			console.log('App dang chay');
			UICtrl.displayMonth();
			UICtrl.displayBudget( {
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percent: 0
			});
			setupEventLi();
		}
	};
	
})(budgetController, UIController);

controller.init();
