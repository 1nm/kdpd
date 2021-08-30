if (window.contentScriptInjected !== true) {
  window.contentScriptInjected = true; // global scope
  const observer = new MutationObserver((mutations) => {
    if (!/kidsdiary.jp\/h\/notice\/detail\/*/.test(window.location)) {
      return;
    }
    const contentNodes = [];
    const images = [];
    for (const { addedNodes } of mutations) {
      for (const addedNode of addedNodes) {
        if (addedNode.tagName && addedNode.tagName == "SECTION") {
          contentNodes.push(
            ...addedNode.querySelectorAll("section.content > div > div > div")
          );
          images.push(...addedNode.querySelectorAll("li > div > img"));
        }
      }
    }
    if (contentNodes.length == 0) {
      return;
    }
    const contentNode = contentNodes[0];
    const imageUrls = images
      .map((img) => img.getAttribute("src"))
      .map((s) => s.substring(0, s.length - 3))
      .map((s) => `https://kidsdiary.jp${s}`);
    // console.log(imageUrls);
    const button = document.createElement("button");
    const buttonDiv = document.createElement("div");
    const title =
      contentNode.children?.[1].firstElementChild?.firstElementChild
        ?.innerHTML || "photo";
    button.innerHTML = `Download All ${imageUrls.length} Photos`;
    button.onclick = function () {
      console.log(`Zipping ${imageUrls.length} images to '${title}.zip' ...`);
      progress.style.display = "block";
      const zip = new JSZip();
      imageUrls.forEach(function (imageUrl, index) {
        const filename = `${index}.jpg`;
        zip.file(
          filename,
          new Promise(function (resolve, reject) {
            JSZipUtils.getBinaryContent(imageUrl, function (err, data) {
              if (err) {
                reject(err);
              } else {
                resolve(data);
              }
            });
          }),
          { binary: true }
        );
      });

      zip
        .generateAsync({ type: "blob" }, function updateCallback(metadata) {
          progress.value = metadata.percent;
        })
        .then(function (content) {
          progress.style.display = "none";
          progress.value = 0;
          console.log(`Downloading '${title}.zip' ...`);
          saveAs(content, `${title}.zip`);
        });
    };
    const progress = document.createElement("progress");
    progress.max = 100;
    progress.value = 0;
    progress.style = "display: none; margin-top: 10px; width: 240px;";
    buttonDiv.style = "padding-left: 16px; padding-top: 16px;";
    buttonDiv.appendChild(button);
    buttonDiv.appendChild(progress);
    contentNode.insertBefore(buttonDiv, contentNode.children[1]);
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
}
