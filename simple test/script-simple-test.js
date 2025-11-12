const taskInputElement = document.getElementById("task");
const previewContainer = document.getElementById("preview-container");
const asyncBtn = document.getElementById("asyncBtn");
const spinner = document.getElementById("spinner");
const totalTime = document.getElementById("totalTime");

let tasks = [];
let startTime;

// Enable button only when there's a task provided
function checkReady() {
  const hasTask = taskInputElement.value;
  const shouldDisable = !(hasTask);
  asyncBtn.disabled = shouldDisable;
}

// function to count request total time
function requestTotalTime() {
  const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
  totalTime.textContent = `Total time: ${totalSeconds}s`;
}

// Async requests here
function processTask(task) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      task.status = isSuccess ? "success" : "error";
      resolve(task);
    }, task.delay);
  })
}

function renderTasks() {
  previewContainer.innerHTML = "";
  tasks.forEach(task => {
    const color = task.status === "pending"  ? "gray" :
                  task.status === "success"  ? "green" : "red"

    const taskCard = `
      <div style="border: 1px solid #ccc; padding: 8px; margin: 4px; border-radius: 4px;">
        <strong>${task.name}</strong>
        <p style="color: ${color}">${task.status}</p>
      </div>
    `;
    previewContainer.insertAdjacentHTML("beforeend", taskCard);
  });
}

// single task
// asyncBtn.addEventListener("click", async () => {
//   const taskName = taskInputElement.value;
//   if (!taskName) return;

//   // add new task to array
//   const newTask = {
//     name: taskName,
//     status: "pending",
//     delay: 1000 + Math.random() * 3000
//   };
//   tasks.push(newTask);

//   // render pending tasks
//   renderTasks();
//   taskInputElement.value = "";
//   asyncBtn.disabled = true;

//   // start time here
//   if (!startTime) startTime = Date.now();

//   spinner.style.display = "block";

//   try {
//     // wait for the task to be completed
//     await processTask(newTask);
//   } catch (error) {
//     console.log(error);
//   }

//   renderTasks();
//   requestTotalTime();

//   spinner.style.display = "none";
//   asyncBtn.disabled = false;
// })

// multiple tasks
asyncBtn.addEventListener("click", async () => {
  const tasksNames = taskInputElement.value
    .split(",")
    .map(task => task.trim())
    .filter(Boolean);

  if (!tasksNames) return;

  // add new task to array
  const allTasks = tasksNames.map(taskName => {
    const newTask = {
      name: taskName,
      status: "pending",
      delay: 1000 + Math.random() * 3000
    };
    tasks.push(newTask);
    return processTask(newTask);
  });

  // render pending tasks
  renderTasks();
  taskInputElement.value = "";
  asyncBtn.disabled = true;

  // start time here
  if (!startTime) startTime = Date.now();
  spinner.style.display = "block";

  // wait for all tasks to complete
  await Promise.allSettled(allTasks);

  // render updated tasks
  renderTasks();
  requestTotalTime();

  spinner.style.display = "none";
  asyncBtn.disabled = false;
})

taskInputElement.addEventListener("input", checkReady);
checkReady();
