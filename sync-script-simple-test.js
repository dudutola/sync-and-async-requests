const inputNumberElement = document.getElementById("number");
const syncBtnTest = document.getElementById("syncBtn");
const previewContainerTest = document.getElementById("preview-container-test");
const resultsDiv = document.querySelector(".results");
const allRequests = [];

const datas = [
  {delay: 1000, status: false},
  {delay: 4000, status: true},
  {delay: 3000, status: true},
  {delay: 2000, status: false}
]

function syncTestRequestPromise(delay, status) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (status) {
        resolve("Success");
      } else {
        reject(new Error("Error"));
      }
    }, delay);
  });
}

// run synchronously, one after another
async function runTestSync() {
  resultsDiv.textContent = "Running datas..."
  allRequests.length = 0;

  for (const data of datas) {
    try {
      const response = await syncTestRequestPromise(data.delay, data.status);
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

inputNumberElement.addEventListener("input", () => syncBtnTest.disabled = false);

syncBtnTest.addEventListener("click", () => runTestSync());
