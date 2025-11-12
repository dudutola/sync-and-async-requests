const wishInputElement = document.getElementById("wish");
const previewContainer = document.getElementById("preview-container");
const asyncBtn = document.getElementById("asyncBtn");
const syncBtn = document.getElementById("syncBtn");
const spinner = document.getElementById("spinner");
const totalTime = document.getElementById("totalTime");

let wishes = [];
let startTime;

// Enable button only when there's a wish provided
function checkReady() {
  const hasWish = wishInputElement.value;
  const shouldDisable = !(hasWish);
  asyncBtn.disabled = shouldDisable;
}

// function to count request total time
function requestTotalTime() {
  const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
  totalTime.textContent = `Total time: ${totalSeconds}s`;
}

// Async requests here
function processWish(wish) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      wish.status = isSuccess ? "success" : "error";
      resolve(wish);
    }, wish.delay);
  })
}

function renderWishes() {
  previewContainer.innerHTML = "";
  wishes.forEach(wish => {
    const color = wish.status === "pending"  ? "gray" :
                  wish.status === "success"  ? "green" : "red"

    const wishCard = `
      <div style="border: 1px solid #ccc; padding: 8px; margin: 4px; border-radius: 4px;">
        <strong>${wish.name}</strong>
        <p style="color: ${color}">${wish.status}</p>
      </div>
    `;
    previewContainer.insertAdjacentHTML("beforeend", wishCard);
  });
}

// single wish
// asyncBtn.addEventListener("click", async () => {
//   const wishName = wishInputElement.value;
//   if (!wishName) return;

//   // add new wish to array
//   const newWish = {
//     name: wishName,
//     status: "pending",
//     delay: 1000 + Math.random() * 3000
//   };
//   wishs.push(newWish);

//   // render pending wishes
//   renderWishes();
//   wishInputElement.value = "";
//   asyncBtn.disabled = true;

//   // start time here
//   if (!startTime) startTime = Date.now();

//   spinner.style.display = "block";

//   try {
//     // wait for the wish to be completed
//     await processWish(newWish);
//   } catch (error) {
//     console.log(error);
//   }

//   renderWishes();
//   requestTotalTime();

//   spinner.style.display = "none";
//   asyncBtn.disabled = false;
// })

// multiple wishes
asyncBtn.addEventListener("click", async () => {
  previewContainer.innerHTML = "";
  wishes = []

  // start time here
  startTime = Date.now();

  const wishesNames = wishInputElement.value
    .split(",")
    .map(wish => wish.trim())
    .filter(Boolean);

  if (wishesNames.length === 0) return;

  // add new wish to array
  const allWishes = wishesNames.map(wishName => {
    const newWish = {
      name: wishName,
      status: "pending",
      delay: 1000 + Math.random() * 3000
    };
    wishes.push(newWish);
    return processWish(newWish);
  });

  // render pending wishes
  renderWishes();
  wishInputElement.value = "";
  asyncBtn.disabled = true;

  spinner.style.display = "block";

  // wait for all wishes to complete
  await Promise.allSettled(allWishes);

  // render updated wishes
  renderWishes();
  requestTotalTime();

  spinner.style.display = "none";
  asyncBtn.disabled = false;
})


// Sync requests here
// syncBtn.addEventListener("click", async () => {

// })

wishInputElement.addEventListener("input", checkReady);
checkReady();
