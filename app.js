var BudgetController = (function() {

    // data structure 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    }

    // income constructor 
    var Income = function(id, value, description)  {
        this._id = id
        this.value = value
        this.description = description
    }

    // expense constructor 
    var Expense = function(id, value, description)  {
        this._id = id
        this.value = value
        this.description = description
    }

    // calculating income and expense total
    const calculateTotal = (type) => {
        let sum = 0

        data.allItems[type].forEach(curr => {
            sum += curr.value
        });

        data.totals[type] = sum
    }

    return {
        // adding the item to data object
        addItem: (type, val, desc) => {
            var newItem, ID 

            // generating ID by getting the id of the last item and incrementing 
            ID = data.allItems[type].length ? (data.allItems[type][data.allItems[type].length-1]._id + 1) : 0

            // checking whether it is expense or income
            if(type == 'inc') {
                newItem = new Income(ID, val, desc)
            }
            else {
                newItem = new Expense(ID, val, desc) 
            }

            data.allItems[type].push(newItem)


            return newItem
        }, 

        // deleting item from data structure
        removeItem: (type, id) => {
            data.allItems[type] = data.allItems[type].filter(curr => curr._id != id)
        },

        // calculating total budget and total expense percentage
        calculateBudget: (type) => {

            // calculating income and expense total
            calculateTotal(type)

            data.budget = data.totals.inc - data.totals.exp

            if (data.totals.inc > 0) {
                data.percentage = ((data.totals.exp / data.totals.inc) * 100).toFixed(2)
            } else {
                data.percentage = -1
            }
        },

        // getting the remaining, total expense % and inc,exp totals
        getBudget: () => {
            return {
                budget:data.budget,
                budgetPercent: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },

        testing: () =>{
            console.log(data)
        }
    }

})(); // IIFE


var UIController = (function() {

    // storing class names in an object for easy maintainability
    var DOMSelectors = {
        inputType: '.add__type',
        inputValue: '.add__value',
        inputDescription: '.add__description',
        inputButton: '.add__btn',
        incomesContainer: '.income__list',
        expensesContainer: '.expenses__list',
        totalBudget: '.budget__value',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        totalPercent: '.budget__expenses--percentage',
        container: '.container'
    }

    return {
        
        // passing the DOM classes to the app controller
        getDOM: () => {
            return DOMSelectors
        },
        // getting the input 
        getInput: () => {
            return {
                type: document.querySelector(DOMSelectors.inputType).value,
                value: parseInt(document.querySelector(DOMSelectors.inputValue).value),
                description: document.querySelector(DOMSelectors.inputDescription).value
            }
        },

        // adding the income/expense to the UI
        addNewItem: (obj, type) => {
            var html, newHTML, element
            
            // checking whether it is expense or income
            if (type == 'inc') {
                element = DOMSelectors.incomesContainer

                html = `<div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
            }
            else {
                element = DOMSelectors.expensesContainer

                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
                        
            }

            // replacing strings with actual data
            newHTML = html.replace('%id%', obj._id)
            newHTML = newHTML.replace('%description%', obj.description)
            newHTML = newHTML.replace('%value%', obj.value)

            // appending the html div 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
        },

        // removing an item from UI
        // removeItem: (type, id) => {

        // }

        // displaying the budget in UI
        displayBudget: (obj) => {
            document.querySelector(DOMSelectors.totalBudget).textContent = obj.budget
            document.querySelector(DOMSelectors.totalIncome).textContent = obj.totalInc
            document.querySelector(DOMSelectors.totalExpense).textContent = obj.totalExp
            if (obj.budgetPercent > 0) {
                document.querySelector(DOMSelectors.totalPercent).textContent = obj.budgetPercent + '%'
            } else {
                document.querySelector(DOMSelectors.totalPercent).textContent = '--'

            }
        },
        
        // clearing the input fields
        clearFields: () => {
            document.querySelector(DOMSelectors.inputDescription).value = ''
            document.querySelector(DOMSelectors.inputValue).value = ''
            document.querySelector(DOMSelectors.inputDescription).focus()
        },

    }

})();  // IIFE


var controller = (function(budgetCtrl, UICtrl) {

    // Event listeners for click and enter button 
    var setupEventListeners = () => {
        
        // getting the classes from UI controller
        var DOM = UICtrl.getDOM();

        document.querySelector(DOM.inputButton).addEventListener('click', () => {
            ctrlAddItem()
        })
    
        document.addEventListener('keypress', (event) => {
            if(event.keyCode == 13 || event.which == 13) {
                ctrlAddItem()
            }
        })

        // event delegation for removing items
        document.querySelector(DOM.container).addEventListener('click', ctrlRemoveItem)
    }
    
    var ctrlAddItem = () => {

        // Getting the input
        const input = UICtrl.getInput()

        // checking whether decription and value provided
        if(input.description && input.value > 0) {
        
            // adding the item to data structure and getting back an object
            const newItem = budgetCtrl.addItem(input.type, input.value, input.description)

            // adding the income/expense to the UI
            UICtrl.addNewItem(newItem, input.type)

            // clearing the input fields
            UICtrl.clearFields()

            // updating the budget
            updateBudget(input.type)
        }
    }

    var updateBudget = (type) => {

        // calculating total budget and total expense percentage
        budgetCtrl.calculateBudget(type)

        // getting the budget
        const budget = budgetCtrl.getBudget()

        // displaying the budget in UI
        UICtrl.displayBudget(budget)
    }

    var ctrlRemoveItem = (event) => {
        var itemID, splitID, type, ID
        
        // getting item id by traversing DOM
        itemID = event.target.parentNode.id

        if (itemID) {
            splitID = itemID.split('-')
            type = splitID[0]
            ID = splitID[1]

            // deleting item from data structure
            budgetCtrl.removeItem(type, ID)
        }
    }

    return {
        // Intializing the entire app
        init: () => {
            UICtrl.displayBudget({
                budget: 0,
                budgetPercent: -1,
                totalInc: 0,
                totalExp: 0
            })
            setupEventListeners()
        }
    }
})(BudgetController, UIController);  // IIFE

// calling the intialization
controller.init()