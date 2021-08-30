if (window.contentScriptInjected !== true) {
  window.contentScriptInjected = true; // global scope
  const observer = new MutationObserver((mutations) => {
    if (!/kidsdiary.jp\/h\/notice\/detail\/*/.test(window.location)) {
      return;
    }
    const contentNodes = [];
    const images = [];
    for (const { addedNodes } of mutations) {
      for (const n of addedNodes) {
        if (!n.tagName) {
          continue;
        }
        if (n.matches("section.content > div > div > div")) {
          contentNodes.push(n);
        } else if (n.firstElementChild) {
          contentNodes.push(
            ...n.querySelectorAll("section.content > div > div > div")
          );
        }
        if (n.matches("li > div > img")) {
          images.push(n);
        } else if (n.firstElementChild) {
          images.push(...n.querySelectorAll("li > div > img"));
        }
      }
    }
    if (contentNodes.length == 0) {
      return;
    }
    const contentNode = contentNodes[0];
    const imageUrls = images.map((img) =>
      img.currentSrc.substring(0, img.currentSrc.length - 3)
    );
    const button = document.createElement("button");
    const buttonDiv = document.createElement("div");
    const title =
      contentNode.children?.[1].firstChild?.firstChild?.innerHTML || "photo";
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
          console.log(`Saving '${title}.zip' ...`);
          saveAs(content, `${title}.zip`);
        });
    };
    const progress = document.createElement("PROGRESS");
    progress.max = 100;
    progress.value = 0;
    progress.style = "display: none; margin-top: 10px; width: 240px;";
    buttonDiv.style = "padding-left: 16px; padding-top: 16px;";
    buttonDiv.appendChild(button);
    buttonDiv.appendChild(progress);
    contentNode.insertBefore(buttonDiv, contentNode.children[1]);
  });

  observer.observe(document.querySelector("#root") || document.body, {
    subtree: true,
    childList: true,
  });
}
