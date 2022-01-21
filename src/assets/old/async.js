const asyncPageAdder = (url, index) =>
  new Promise((resolve, reject) => {
    const img = uMap[index];
    console.log(img, url);

    if (index !== 0) doc.addPage("p", "px", [img.w, img.h]);
    doc.addImage(img.data, undefined, 0, 0, img.w, img.h);
    resolve("done");
  });

const asyncPageMapper = async (array) => {
  const promises = array.map((url) => {
    qs(".progBar").style.width = `${
      (pageData.indexOf(url) / pageData.length / 2) * 100 + 50
    }%`;
    qs(".progText").innerText = `Processing page #${pageData.indexOf(url) + 1}`;
    return asyncPageAdder(url, pageData.indexOf(url));
  });
  const results = await Promise.all(promises);
  return results;
};

asyncPageMapper(pageData).then(() => {
  qs(".progBar").style.width = `100%`;
  qs(".progText").innerText = `Downloading PDF file`;
  doc.save("doc.pdf");
});
