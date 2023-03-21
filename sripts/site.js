"use strict"


const tasksModule = {
    tasks: [],
    add(id = 'defaultValue', name, description, status, priority, assignee, reporter, modifiedAt, created_at, completed_at) {
        const task = {
            id: id,
            name: name,
            description: description,
            status: status,
            modifiedAt: modifiedAt,
            priority: priority,
            assignee: assignee,
            reporter: reporter,
            created_at: created_at,
            completed_at: completed_at
        }
        this.tasks.push(task)
        this.emit("add", task)
    },
    edit(id, name, description, status, modifiedAt, priority, assignee, completed_at, created_at, reporter, external = 'defaultValue') {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                task.name = name
                task.description = description
                task.status = status
                task.modifiedAt = modifiedAt
                task.priority = priority
                if (assignee !== "") {
                    task.assignee = assignee
                }
                task.completed_at = completed_at
                task.created_at = created_at
                if (reporter !== undefined) {
                    task.reporter = reporter
                }
                task.external = external,
                    this.emit("edit", task)
            }
        }
    },
    remove(id) {
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                this.tasks.splice(index, 1)
                this.emit("remove", task)
            }
        }
    },
    events: {},
    emit(eventName, param) {
        if (eventName in this.events) {
            for (const f of this.events[eventName]) {
                f(param)
            }
        }
    },
    on(eventName, cb) {
        if (!(eventName in this.events)) {
            this.events[eventName] = []
        }
        this.events[eventName].push(cb)
    },
    getTaskbyID(id) {
        var taskToReturn
        for (const index in this.tasks) {
            const task = this.tasks[index]
            if (task.id === id) {
                taskToReturn = task
            }
        } return taskToReturn
    },

    creatCurrenTime() {
        const now = new Date()
        const isoString = now.toISOString()

        const timezoneOffset = now.getTimezoneOffset()
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
        const offsetMinutes = Math.abs(timezoneOffset) % 60
        const offsetSign = timezoneOffset >= 0 ? "-" : "+"
        const timezoneOffsetString = `${offsetSign}${padZero(offsetHours)}:${padZero(offsetMinutes)}`
        const isoStringWithOffset = `${isoString.slice(0, -1)}${timezoneOffsetString}`

        function padZero(num) {
            return num < 10 ? `0${num}` : num;
        }
        return isoStringWithOffset
    },
    assignee: [
        {
            firstname: "",
            role: "",
            surname: "",
            id: 0,
            email: "",
        }, {
            firstname: "Michael",
            role: "development",
            surname: "Acher",
            id: 1,
            email: "michael.acher@example.com",
        }, {
            firstname: "Michelle",
            role: "development",
            surname: "Laut",
            id: 2,
            email: "michelle.laut@example.com",
        }],
    findAssignee(id) {
        var assigneeToReturn
        id = parseInt(id)
        for (const assignee of this.assignee) {
            if (assignee.id === id) {
                assigneeToReturn = assignee
            }
        } return assigneeToReturn
    }
}
document.addEventListener("DOMContentLoaded", () => {

    const elements = {
        createButton: document.getElementById("task-button"),
        createBlock: document.getElementById("create-new-task-block"),
        done: document.getElementById("done"),
        inprogress: document.getElementById("inprogress"),
        savebutton: document.getElementById("save-button"),
        taskName: document.getElementById("task-name"),
        taskDescription: document.getElementById("task-description"),
        taskstatus: document.getElementById("task-status"),
        tasksPriority: document.getElementById("task-priority"),
        tasksAssignee: document.getElementById("task-assignee"),
        tasksReporter: document.getElementById("task-reporter"),
        tasksCompleted: document.getElementById("task-completed_at"),
        tasksCreated: document.getElementById("task-created_at"),
        cancelButton: document.getElementById("cancel-button"),
      //  historyButton: document.getElementById("history-button"),
        todo: document.getElementById("todo"),
        editButton: document.getElementById("edit-button"),
        delteButton: document.getElementById("delete-button"),
        actiondescription: document.getElementById("action-description"),
        TaskIdElement: document.getElementById("TaskIdElement")

    }
    const boxes = []

    boxes.push(done)
    boxes.push(inprogress)
    boxes.push(todo)

    let draggedElement;
    let draggedElementID;

    for (const box of boxes) {
        box.addEventListener("dragenter", (e) => {
            e.preventDefault();
            e.target.classList.add('drag-over');
        });

        box.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.target.classList.add('drag-over');
        });

        box.addEventListener("dragleave", (e) => {
            e.target.classList.remove('drag-over');
        });

        box.addEventListener("dragstart", (e) => {
            draggedElement = e.target;
            draggedElementID = draggedElement.id
        });

        box.addEventListener("drop", async (e) => {
            e.target.classList.remove('drag-over');
            e.preventDefault();
            const newStatus = e.target.id
            const draggable = tasksModule.getTaskbyID(draggedElementID)

            if (newStatus === elements.todo.id || newStatus === elements.inprogress.id || newStatus === elements.done.id) {
                var modifiTime = await PutToDevAPI(draggedElementID, draggable.name, draggable.description, newStatus, draggable.priority, draggable.assignee)
                // const startIndex = modifiTime.indexOf('"') + 1;
                // const endIndex = modifiTime.indexOf('"', startIndex);
                // modifiTime = modifiTime.slice(startIndex, endIndex);
                // if (newStatus === "done") {
                //     var newCompleted_at = modifiTime
                // }
                // tasksModule.edit(draggedElementID, draggable.name, draggable.description, newStatus, modifiTime, draggable.priority, draggable.assignee, newCompleted_at, draggable.created_at, draggable.reporter);
                GetTodosOfApi()
            }
        });
    }

    elements.createBlock.classList.add("not-displayed")


    function deleteInput() {
        elements.taskName.value = ""
        elements.taskDescription.value = ""
        elements.tasksCompleted.value = ""
        elements.tasksCreated.value = ""
        elements.tasksPriority.value = "low"
        elements.tasksReporter.value = ""
        elements.taskstatus.value = "todo"

    }

    function toggleCreatewindow() {
        if (elements.createBlock.classList.contains("displayed")) {
            elements.todo.style.display = "block"
            elements.done.style.display = "block"
            elements.inprogress.style.display = "block"
            elements.createBlock.style.display = "none"
            elements.createButton.style.display = "block"

            elements.createBlock.classList.remove("displayed")
            elements.createBlock.classList.add("not-displayed")

        } else if (elements.createBlock.classList.contains("not-displayed")) {
            elements.todo.style.display = "none"
            elements.done.style.display = "none"
            elements.inprogress.style.display = "none"
            elements.createBlock.style.display = "block"
            elements.createButton.style.display = "none"

            elements.createBlock.classList.remove("not-displayed")
            elements.createBlock.classList.add("displayed")
        }

    }


    elements.createButton.addEventListener("click", (e) => {
        elements.savebutton.style.display = "block"
        elements.editButton.style.display = "none"
       // elements.historyButton.style.display = "none"
        elements.delteButton.style.display = "none"
        elements.actiondescription.innerText = "New Task"
        deleteInput()
        toggleCreatewindow()
    })


    elements.cancelButton.addEventListener("click", (e) => {
        const currentId = elements.TaskIdElement.innerText
        const currentElement = document.getElementById(currentId)

        if (!currentElement) {
            deleteInput()
            toggleCreatewindow()
            return
        }
        if (currentElement.classList.contains("in-edit") && currentElement) {
            currentElement.classList.remove("in-edit")
        }
        if (elements.createButton.style.display = "none") {
            elements.createButton.style.display = "block"
        }


        deleteInput()
        toggleCreatewindow()
    })

    elements.savebutton.addEventListener("click", async (e) => {
        const inputName = elements.taskName.value
        const inputDesc = elements.taskDescription.value
        const inputStatus = elements.taskstatus.value
        const inputPriority = elements.tasksPriority.value
        const inputAssignee = tasksModule.findAssignee(parseInt(elements.tasksAssignee.value))
        const inputReporter = elements.tasksReporter.value
        var ToDoID = ""

        for (const task of tasksModule.tasks) {
            if (task.name === inputName && task.description === inputDesc) {
                alert("ToDo besteht bereits")
                toggleCreatewindow()
                deleteInput()
                return
            }
        }

        if (!inputName) {
            alert("Bitte ein ToDo-Namen hinterlegen")
            return
        }

        var inputTask = {
            name: inputName,
            description: inputDesc,
            status: inputStatus,
            priority: inputPriority,
            assignee: inputAssignee,
        }
        const inputString = await PostToDevApi(inputTask)
        GetTodosOfApi()
        deleteInput()
        toggleCreatewindow()
    })

   /* elements.historyButton.addEventListener("click", async (e) => {
        const currentId = elements.TaskIdElement.innerText
        var message = await getHistoryOfTodo(currentId)
        alert(message)

    })*/

    elements.editButton.addEventListener("click", async (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const id = task.id

        if (elements.taskName.value) {
            var modifiTime = await PutToDevAPI(id, elements.taskName.value, elements.taskDescription.value, elements.taskstatus.value, elements.tasksPriority.value, tasksModule.findAssignee(parseInt(elements.tasksAssignee.value)))
            if (elements.taskstatus.value === "done") {
                var newCompleted_at = modifiTime
            }
            GetTodosOfApi()
        }

        task.classList.remove("in-edit")

        toggleCreatewindow()

        elements.savebutton.style.display = "block"
        elements.editButton.style.display = "none"

        deleteInput()
        elements.createButton.style.display = "block"

    })

    elements.delteButton.addEventListener("click", (e) => {
        const task = document.getElementsByClassName("in-edit")[0]
        const taskId = task.id
        tasksModule.remove(taskId)
    })

    tasksModule.on("add", (task) => {
        const divElement = document.createElement("div")
        divElement.setAttribute("id", task.id)
        divElement.setAttribute("draggable", "true")
        divElement.classList.add("task")
        const spanElementTitle = document.createElement("span")
        spanElementTitle.classList.add("title")
        spanElementTitle.setAttribute("title", task.name)
        spanElementTitle.innerHTML = task.name

        divElement.appendChild(spanElementTitle)

        const spanElementDesc = document.createElement("span")
        spanElementDesc.setAttribute("description", task.name)
        spanElementDesc.classList.add("description")
        spanElementDesc.setAttribute("hidden", "hidden")
        spanElementDesc.innerHTML = task.description

        divElement.appendChild(spanElementDesc)
        if (task.status === "done") {
            elements.done.appendChild(divElement)
        } else if (task.status === "todo") {
            elements.todo.appendChild(divElement)
        } else if (task.status === "inprogress") {
            elements.inprogress.appendChild(divElement)
        }

    })

    tasksModule.on("add", (task) => {
        const element = document.getElementById(task.id)
        element.addEventListener("click", (e) => {
            element.classList.add("in-edit")
            elements.createButton.style.display = "none"
            elements.taskName.value = task.name
            elements.taskDescription.value = task.description
            elements.taskstatus.value = task.status
            elements.tasksAssignee.value = task.assignee.id
            elements.tasksPriority.value = task.priority
            if (task.reporter === undefined) {
                elements.tasksReporter.value = ""
            } else if (task.reporter === null) {
                elements.tasksCompleted.value = ""
            }
            else {
                elements.tasksReporter.value = task.reporter.email
            }
            if (task.completed_at === undefined) {
                elements.tasksCompleted.value = ""
            } else {
                elements.tasksCompleted.value = task.completed_at
            }
            if (task.created_at === undefined) {
                elements.tasksCreated.value = ""
            } else {
                elements.tasksCreated.value = task.created_at
            }
            toggleCreatewindow()
            elements.savebutton.style.display = "none"
            elements.editButton.style.display = "block"
         //   elements.historyButton.style.display = "block"
            elements.delteButton.style.display = "block"
            elements.actiondescription.innerText = "Edit Task"
            elements.TaskIdElement.innerText = task.id
        })

    })
    tasksModule.on("add", (task) => {
        const element = document.getElementById(task.id)

        element.addEventListener("dragstart", (e) => {
            setTimeout(() => {
                e.target.classList.add('hide')
            }, 0)
            element.classList.add("dragged")
        })
        element.addEventListener("dragend", (e) => {
            setTimeout(() => {
                e.target.classList.remove('hide')
            }, 0)
        })

    })

    tasksModule.on("edit", (task) => {
        const element = document.getElementById(task.id)
        const titleInDom = 0
        const descriptionInDom = 1

        if (element.classList.contains("dragged")) {
            elements[task.status].append(element)
            element.classList.remove("dragged")
        } else if (task.external === true) {
            element.childNodes[titleInDom].textContent = task.name
            element.childNodes[descriptionInDom].textContent = task.description
        } else {
            element.title = elements.taskName.value
            element.childNodes[titleInDom].textContent = elements.taskName.value
            element.childNodes[descriptionInDom].textContent = elements.taskDescription.value
            element.description = elements.taskDescription.value

            if (element.parentNode.id !== task.status) {
                elements[task.status].append(element)
            }
        }
        element.classList.remove("in-edit")
    })

    tasksModule.on("edit", (task) => {
        const taskInDom = document.getElementById(task.id)
        if (task.external === true) {
            if (taskInDom.parentElement.id !== task.status) {
                taskInDom.remove()
                elements[task.status].append(taskInDom)
            }
        }
    })


    tasksModule.on("remove", (task) => {
        const element = document.getElementById(task.id)
        element.remove()
        toggleCreatewindow()
    })

    //////////////////////////// Anbindung an die API //////////////////////////////////////

    // Synchronisation mit der Dev API  

    function GetTodosOfApi() {
        fetch("http://localhost:8081/todos", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                for (const todo of data) {
                    var contains = false
                    var statusToEdit = ""
                    if (todo.status === "created" || todo.status === "on_hold") {
                        todo.status = "todo"
                    } if (todo.status === "in_progress") {
                        todo.status = "inprogress"
                    }
                    for (var i = 0; i < tasksModule.tasks.length; i++) {
                        if (todo.modified_at) {
                            if (tasksModule.tasks[i].id === todo.id) {
                                contains = true
                                const DateInterTask = new Date(tasksModule.tasks[i].modifiedAt)
                                const DateExternTodo = new Date(todo.modified_at)

                                if (DateInterTask < DateExternTodo) {
                                    if (todo.responsibility === "support") {
                                        statusToEdit = todo.responsibility
                                    } else {
                                        statusToEdit = todo.status
                                    }
                                    tasksModule.edit(todo.id, todo.title, todo.description, statusToEdit, todo.modified_at, todo.priority, todo.assignee, todo.completed_at, todo.created_at, todo.reporter, true)
                                }
                                break
                            }
                        }

                    }
                    if (!contains) {
                        if (!todo.assignee.id) {
                            todo.assignee.id = 0
                        }
                        tasksModule.add(todo.id.toString(), todo.title, todo.description, todo.status, todo.priority, todo.assignee, todo.reporter, todo.modified_at, todo.created_at, todo.completed_at)
                    }
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });

        setTimeout(GetTodosOfApi, 4000);
    }
    GetTodosOfApi();

    async function PostToDevApi(task) {
        var StatusToSend = "";
        var ToDoID = null;
        if (task.external === true) {
            return;
        }

        const current_time = tasksModule.creatCurrenTime()

        var completed_at = "2000-01-20T01:00:00.000+00:00";
        if (task.status === "done") {
            StatusToSend = "done";
            completed_at = current_time;
        }
        if (task.status === "todo") {
            StatusToSend = "created";
        }
        if (task.status === "inprogress") {
            StatusToSend = "in_progress";
        }
        const data = {
            completed_at: completed_at,
            responsibility: "development",
            description: task.description,
            created_at: current_time,
            assignee: task.assignee,
            title: task.name,
            priority: task.priority,
            status: StatusToSend,
        };

        try {
            const response = await fetch("http://localhost:8081/todos", {
                method: "POST",
                body: JSON.stringify(data),
            });
            const responseData = await response.text();
            ToDoID = responseData;
            console.log("Success:", responseData);
        } catch (error) {
            console.error("Error:", error);
        }

        return ToDoID;
    }

    async function PutToDevAPI(id, title, description, status, priority, assignee, reporter) {
        var StatusToSend = "";
        var ToDoID = null;
        const current_time = tasksModule.creatCurrenTime()

        var completed_at = "2000-01-20T01:00:00.000+00:00";
        if (status === "done") {
            StatusToSend = "done";
            completed_at = current_time;
        }
        if (status === "todo") {
            StatusToSend = "created";
        }
        if (status === "inprogress") {
            StatusToSend = "in_progress";
        }

        const data = {
            completed_at: completed_at,
            responsibility: "development",
            description: description,
            created_at: current_time,
            reporter: reporter,
            assignee: assignee,
            title: title,
            priority: priority,
            status: StatusToSend,
        };

        try {
            const response = await fetch("http://localhost:8081/todos/" + id, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            const responseData = await response.text();
            ToDoID = responseData;
            console.log("Success:", responseData);
        } catch (error) {
            console.error("Error:", error);
        }

        return ToDoID;
    }

    async function DeleteToDevApi(task) {
        var StatusToSend = task.assignee;
        if (task.external === true) {
            return;
        }

        const current_time = tasksModule.creatCurrenTime()

        var completed_at = "2000-01-20T01:00:00.000+00:00";
        if (task.status === "done") {
            completed_at = current_time;
        }
        if (task.status === "todo") {
            StatusToSend = "created";
        }
        if (task.status === "inprogress") {
            StatusToSend = "in_progress";
        }

        const data = {
            completed_at: completed_at,
            responsibility: "development",
            description: task.description,
            created_at: current_time,
            reporter: task.reporter,
            assignee: task.assignee,
            title: task.name,
            priority: task.priority,
            status: StatusToSend,
        };
        fetch("http://localhost:8081/todos/" + task.id, {
            method: "DELETE",
            body: JSON.stringify(data)
        })
            .then((response) => response.text())
            .then((data) => {
                console.log("Success", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    async function getHistoryOfTodo(id) {
        var dataToReturn = null
        try {
            const response = await fetch("http://localhost:8081/history/" + id, {
                method: "GET",
            });
            const responseData = await response.text();
            dataToReturn = responseData
            console.log("Success:", responseData);
        } catch (error) {
            console.error("Error:", error);
        }

        return dataToReturn
    }
    tasksModule.on("remove", async (task) => {
        await DeleteToDevApi(task)
        GetTodosOfApi()
    })

})