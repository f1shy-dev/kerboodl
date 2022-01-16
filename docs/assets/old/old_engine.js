// helper things to reduce long repeated lines
const qs = (q) => document.querySelector(q);
const show = (h, i) =>
  [h].flat().forEach((g) => (qs(g).style.display = i || "flex"));
const hide = (h) => show(h, "none");
const innerText = (i, t) => (qs(i).innerText = t);
const _ = undefined;

const sanitise = async () => {
  // convert bookURL from query into url for kerboodle book data
  const bookURL = atob(new URLSearchParams(window.location.search).get("c"));
  const split = bookURL.split("/");
  const dataURL = split.slice(0, split.length - 1).join("/") + "/data.js";

  // get the book data and parse it as JSON
  const rawData = await (await fetch(dataURL)).text();
  const trimmed = rawData.substring(11, rawData.length - 1);
  const data = JSON.parse(trimmed);

  // read the XML file inside the JSON, and sanitise the page
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    data["LearningObjectInfo.xml"],
    "text/xml"
  );
  const rawPages = Array.from(doc.querySelector("pages").children);
  const pageData = rawPages.map((elem) => elem.children[0].innerHTML);
  console.log(doc);
  qs(".bookImg").src = pageData[0];
  const title = doc.querySelector("title").innerHTML;
  innerText(".bookTitle", title);
  innerText(".bookID", "#" + doc.querySelector("ID").innerHTML);
  hide(".loading");
  show(".bookContainer");
  qs(".dlPDF").addEventListener("click", () =>
    download(pageData, "pdf", title)
  );
  qs(".dlZIP").addEventListener("click", () =>
    download(pageData, "zip", "title")
  );
  // hide([".dlPDF", ".dlZIP"]);
};

sanitise().catch((e) => {
  console.log(e);
  hide([".loading", ".title", ".bookContainer"]);
  show(".error");
});

const download = async (pageData, type, bookName) => {
  const asyncMapper = async (array) => {
    const promises = array.map((c, i, a) => u2b64(c, i, a));
    const results = await Promise.all(promises);
    return results;
  };

  const addPage = async (doc, img) => {
    await Promise.resolve(doc.addPage("p", "px", [img.w, img.h]));
    await Promise.resolve(doc.addImage(img.data, _, 0, 0, img.w, img.h));
  };

  asyncMapper(pageData)
    .then(async (uMap) => {
      window.uMap = uMap;
      window.pageData = pageData;
      const doc = new jspdf.jsPDF("p", "px", [uMap[0].w, uMap[0].h]);

      const promises = uMap.map((img) => addPage(doc, img));
      await Promise.all(promises);

      qs(".progText").innerText = `Downloading PDF file`;
      doc.save("doc.pdf");
    })
    .catch((e) => {
      console.log(e);
      hide([".loading", ".title", ".bookContainer"]);
      show(".error");
      qs(".error > p").innerText =
        "There was an error downloading the pages for your book. Please try again later.";
    });
};

const u2b64 = (url, index, array) =>
  new Promise((resolve, reject) => {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      qs(".progBar").style.width = `${(index / array.length) * 100}%`;
      qs(".progText").innerText = `Downloading page #${index + 2}`;
      // var canvas = document.createElement("canvas");
      // canvas.width = img.width;
      // canvas.height = img.height;
      // var ctx = canvas.getContext("2d");
      // ctx.drawImage(img, 0, 0);
      // const data = canvas
      //   .toDataURL("image/png")
      //   .replace(/^data:image\/(png|jpg|jpeg);base64,/g, "");
      if (index === array.length - 1) {
        qs(".progBar").style.width = `100%`;
        qs(".progText").innerText = `Processing ${array.length} pages`;
      }
      resolve({ data: img, w: img.width, h: img.height });
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
