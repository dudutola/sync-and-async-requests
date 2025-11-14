const apiKey = document.getElementById("apiKey");
const imageInputElement = document.getElementById("imageInput");
const previewContainer = document.getElementById("preview-container");
// sync
const describeBtnSync = document.getElementById("describeBtnSync");
const openaiSyncResults = document.getElementById("openai-sync-results");
// async
const describeBtnAsync = document.getElementById("describeBtnAsync");
const openaiAsyncResults = document.getElementById("openai-async-results");

// check if inputs not empty
function checkReady() {
  const hasApiKey = apiKey.value.trim().length > 0;
  const shouldDisable = !hasApiKey;
  describeBtnSync.disabled = shouldDisable;
  describeBtnAsync.disabled = shouldDisable;
}

// display images
imageInputElement.addEventListener("change", (e) => {
  const files = e.target.files;

  if (files.length > 0) {
    previewContainer.innerHTML = "";

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageCard = `
          <div class="card-image" style="display: flex; gap: 1rem;" >
            <img src="${event.target.result}" alt="" style="width: 200px; object-fit:cover;">
            <p style="flex: 1;" class="caption"></p>
          </div>
        `;

        previewContainer.insertAdjacentHTML("beforeend", imageCard);
      }
      reader.readAsDataURL(file);
    }
  }
})

apiKey.addEventListener("input", checkReady);
checkReady();

async function apiFetch(image) {
  return await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.value}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in detail.' },
            {
              type: 'image_url',
              image_url: {
                url: `${image.src}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })
  });
}

// sync requests
describeBtnSync.addEventListener("click", async () => {
  const imgElements = document.querySelectorAll("img");

  let start = Date.now();

  for (const imgElement of imgElements) {
    imgElement.nextElementSibling.textContent = "Describing image...";

    try {
      const response = await apiFetch(imgElement);
      if (!response.ok) throw await response.json();

      const dataResponse = await response.json();
      imgElement.nextElementSibling.textContent = dataResponse.choices[0].message.content;
      // captionElement.textContent = dataResponse.choices[0].message.content;
    } catch (error) {
      imgElement.nextElementSibling.textContent = "Error: " + error.message;
    }
  }

  showTotalTime(start);
})


// async requests
describeBtnAsync.addEventListener("click", async () => {
  const imgElements = document.querySelectorAll("img");

  let start = Date.now();

  const allRequests = Array.from(imgElements).map(async (imgElement) => {
    imgElement.nextElementSibling.textContent = "Describing image...";

    try {
      const response = await apiFetch(imgElement);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message);
      }

      const dataResponse = await response.json();
      return { imgElement: imgElement, description: dataResponse.choices[0].message.content };
    } catch (error_1) {
      throw { imgElement: imgElement, error: error_1 };
    }
  })

  // allpromises
  const allPromises = await Promise.allSettled(allRequests);

  for (const result of allPromises) {
    if (result.status === "fulfilled") {
      result.value.imgElement.nextElementSibling.textContent = result.value.description;
    } else {
      result.value.imgElement.nextElementSibling.textContent = result.value.error;
    }
  }

  showTotalTime(start);
})
