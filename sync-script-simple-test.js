const syncBtnTest = document.getElementById("syncBtn");
const previewContainerTest = document.getElementById("preview-container-test");
const resultsDiv = document.querySelector(".results");
const allRequests = [];

const datas = [
  {description: "go to the gym", delay: 1000, status: false},
  {description: "go shopping", delay: 4000, status: true},
  {description: "go see sister", delay: 3000, status: true},
  {description: "go to the club", delay: 2000, status: false}
]

function syncTestRequestPromise(data) {
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

// run synchronously, one after another
async function runTestSync() {
  resultsDiv.textContent = "Running datas..."
  allRequests.length = 0;

  for (const data of datas) {
    try {
      const response = await syncTestRequestPromise(data);
      allRequests.push(response);
    } catch (error) {
      const response = error.message;
      allRequests.push(response)
    }

    resultsDiv.innerHTML = allRequests.map(result => {
      return `<span>${result}</span><br>`;
    }).join("");
  }

  syncBtnTest.disabled = true;
}

syncBtnTest.addEventListener("click", () => runTestSync());
