const imageInputElement = document.getElementById('imageInput');
const previewContainer = document.getElementById('preview-container');
const describeBtn = document.getElementById('describeBtn');
const apiKeyInput = document.getElementById('apiKey');



// Enable button only when image and API key are provided
function checkReady() {
  const hasImage = imageInputElement.files && imageInputElement.files[0];
  const hasKey = apiKeyInput.value.trim().length > 0;
  describeBtn.disabled = !(hasImage && hasKey);
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
        previewContainer.insertAdjacentHTML('beforeend', cardImageElement);
      }
      reader.readAsDataURL(file);
    }

    checkReady();
  }
})
apiKeyInput.addEventListener('input', checkReady);

describeBtn.addEventListener("click", async () => {
  describeBtn.disabled = true;

  const imgElements = document.querySelectorAll('img');

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

  for (const result of allPromisess) {
    if (result.status === 'fulfilled') {
      result.value.imgElement.nextElementSibling.textContent = result.value.description;
    } else {
      result.value.imgElement.nextElementSibling.textContent = result.value.error;
    }
  }
});
