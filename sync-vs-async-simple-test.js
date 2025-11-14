const syncBtnTest = document.getElementById("syncBtn");
const asyncBtnTest = document.getElementById("asyncBtn");
const testSyncResultsDiv = document.getElementById("test-sync-results");
const testAsyncResultsDiv = document.getElementById("test-async-results");
const totalTime = document.getElementById("total-time");

const datas = [
  {description: "go to the gym", delay: 1000, status: false},
  {description: "go shopping", delay: 4000, status: true},
  {description: "go see sister", delay: 3000, status: true},
  {description: "go to the club", delay: 2000, status: false}
]

function testRequestPromise(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.status) {
        resolve(`Success: ${data.description}`);
      } else {
        reject(new Error(`Error: ${data.description}`));
      }
    }, data.delay);
  });
}

function showTotalTime(startTime) {
  let timeTaken = Date.now() - startTime;
  totalTime.textContent = `Total time: ${ (timeTaken/1000).toFixed(2) } seconds`;
}

// run synchronously, one after another
async function runTestSync() {
  testSyncResultsDiv.textContent = "Running tests..."
  allRequests = [];
  let start = Date.now();

  for (const data of datas) {
    try {
      const response = await testRequestPromise(data);
      allRequests.push(response);
    } catch (error) {
      const response = error.message;
      allRequests.push(response)
    }

    testSyncResultsDiv.innerHTML = allRequests.map(result => {
      return `<span>${result}</span><br>`;
    }).join("");
  }

  showTotalTime(start);
}

// run asynchrnously, all at the same time
async function runTestAsync() {
  testAsyncResultsDiv.textContent = "Running tests..."

  let start = Date.now();

  const allRequests = datas.map(data => {
    return testRequestPromise(data);
  })

  const allPromises = await Promise.allSettled(allRequests);

  testAsyncResultsDiv.innerHTML = allPromises.map(result => {
    if (result.status === 'fulfilled'){
      return `<span style="color: green;">${result.value}</span><br>`;
    }
    if (result.status === 'rejected'){
      return `<span style="color: red;">${result.reason.message}</span><br>`;
    }
  }).join("");

  showTotalTime(start);
}


syncBtnTest.addEventListener("click", () => {
  syncBtnTest.disabled = true;
  // consider passing targetElement to later select next sibling
  runTestSync();
});

asyncBtnTest.addEventListener("click", () => {
  asyncBtnTest.disabled = true;
  // consider passing targetElement to later select next sibling
  runTestAsync();
})
