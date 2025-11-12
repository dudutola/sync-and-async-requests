const imageInputElement = document.getElementById("imageInput");
const previewContainer = document.getElementById("preview-container");
const describeBtnAsync = document.getElementById("describeBtnAsync");
const describeBtnSync = document.getElementById("describeBtnSync");
const restartBtn = document.getElementById("restart");
const apiKeyInput = document.getElementById("apiKey");
const spinner = document.getElementById("spinner");
const totalTime = document.getElementById("totalTime");

let countRequestSeconds = 0;

// Enable button only when image and API key are provided
function checkReady() {
  const hasImage = imageInputElement.files && imageInputElement.files[0];
  const hasKey = apiKeyInput.value.trim().length > 0;
  const shouldDisable = !(hasImage && hasKey);
  describeBtnAsync.disabled = shouldDisable;
  describeBtnSync.disabled = shouldDisable;
}

// function to restar all
restartBtn.addEventListener("click", () => {
  apiKeyInput.value = "";
  imageInputElement.value = "";
  previewContainer.innerHTML = "";
  countRequestSeconds = 0;
  totalTime.textContent = "";
})


// function to count request total time
function requestTotalTime() {
  countRequestSeconds ++;
  totalTime.textContent = `Total time: ${countRequestSeconds}s`;
}

imageInputElement.addEventListener('change', (event) => {
  const files = event.target.files;

  if (files.length > 0) {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = function(ev) {

        const cardImageElement = `
        <div class="card-image" style="padding: 1rem;">
          <img style="width: 100%" class="img-preview" src="${ev.target.result}" alt="">
          <p class="caption"></p>
        </div>
        `
        previewContainer.insertAdjacentHTML("beforeend", cardImageElement);
      }
      reader.readAsDataURL(file);
    }

    checkReady();
  }
})
apiKeyInput.addEventListener("input", checkReady);


// Async requests here
describeBtnAsync.addEventListener("click", async () => {
  const imgElements = document.querySelectorAll("img");
  describeBtnAsync.disabled = describeBtnSync.disabled = true;
  spinner.style.display = "block";

  const allRequests = Array.from(imgElements).map((imgElement) => {
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyInput.value}`
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
                    url: `${imgElement.src}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      })
      .then(async (response) => {

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return { imgElement: imgElement, description: data.choices[0].message.content }
      })
      .catch((error) => {
        throw { imgElement: imgElement, error: error};
      })
  })

  const allPromisess = await Promise.allSettled(allRequests);

  spinner.style.display = 'none';

  for (const result of allPromisess) {
    if (result.status === 'fulfilled') {
      result.value.imgElement.nextElementSibling.textContent = result.value.description;
    } else {
      result.value.imgElement.nextElementSibling.textContent = result.value.error;
    }
    requestTotalTime();
  }
});


// Sync requests here
describeBtnSync.addEventListener("click", async () => {
  const imgElements = document.querySelectorAll('img');
  describeBtnAsync.disabled = describeBtnSync.disabled = true;
  spinner.style.display = "block";

  for (const img of imgElements) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyInput.value}`
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
                    url: `${img.src}`
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      if (!response.ok) throw await response.json();

      const data = await response.json();
      img.nextElementSibling.textContent = data.choices[0].message.content;

      requestTotalTime();
    } catch (error) {
      img.nextElementSibling.textContent = "Error: " + (error.error?.message || error.message)
    }
  }

  spinner.style.display = "none";
});
