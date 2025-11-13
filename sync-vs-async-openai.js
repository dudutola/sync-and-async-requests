const apiKey = document.getElementById("apiKey");
const imageInputElement = document.getElementById("imageInput");
const describeBtnSync = document.getElementById("describeBtnSync");
const previewContainerSync = document.getElementById("preview-container-sync");
const openaiSyncResults = document.getElementById("openai-sync-results");

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


// describeBtnSync.addEventListener("click", async () => {
//   const images = Array.from(imageInputElement.files);

//   for (const image of images) {
//     const reader = new FileReader();

//     reader.onload = async () => {
//       const base64 = reader.result.split(",")[1];

//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${apiKey.value}`
//         },
//         body: JSON.stringify({
//           model: 'gpt-4o',
//           messages: [
//             {
//               role: 'user',
//               content: [
//                 { type: 'text', text: 'Describe this image in detail.' },
//                 {
//                   type: 'image_url',
//                   image_url: {
//                     url: `data:image/jpeg;base64,${base64}`
//                   }
//                 }
//               ]
//             }
//           ],
//           max_tokens: 300
//         })
//       });

//       if (!response.ok) throw await response.json();

//       const dataResponse = await response.json();
//       console.log(dataResponse)
//     }
//     reader.readAsDataURL(image);
//   }
// })


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
