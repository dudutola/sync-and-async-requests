const apiKey = document.getElementById("apiKey");
const imageInputElement = document.getElementById("imageInput");
// sync
const describeBtnSync = document.getElementById("describeBtnSync");
const previewContainerSync = document.getElementById("preview-container-sync");
const openaiSyncResults = document.getElementById("openai-sync-results");
// async
const describeBtnAsync = document.getElementById("describeBtnAsync");
const previewContainerAsync = document.getElementById("preview-container-async");
const openaiAsyncResults = document.getElementById("openai-async-results");

// display images
imageInputElement.addEventListener("change", (e) => {
  const files = e.target.files;

  if (files.length > 0) {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageCard = `
          <div class="card-image">
            <img src="${event.target.result}" alt="" style="width: 20%;">
            <p class="caption"></p>
          </div>
        `;

        previewContainerSync.insertAdjacentHTML("beforeend", imageCard);
      }
      reader.readAsDataURL(file);
    }
  }
})


// sync requests
describeBtnSync.addEventListener("click", async () => {
  const imgElements = document.querySelectorAll("img");

  for (const img of imgElements) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

      const dataResponse = await response.json();
      img.nextElementSibling.textContent = dataResponse.choices[0].message.content;
    } catch (error) {
      img.nextElementSibling.textContent = "Error: " + error.message;
    }
  }
})


// async requests
describeBtnAsync.addEventListener("click", async () => {
  const imgElements = document.querySelectorAll("img");

  const allRequests = Array.from(imgElements).map((imgElement) => {
    return fetch('https://api.openai.com/v1/chat/completions', {
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
                  url: `${imgElement.src}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message);
      }

      const dataResponse = await response.json();
      return { imgElement: imgElement, description: dataResponse.choices[0].message.content }
    })
    .catch((error) => {
      throw { imgElement: imgElement, error: error }
    })
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
})
