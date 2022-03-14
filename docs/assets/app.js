// helper things to reduce long repeated lines
const qs = (q) => document.querySelector(q);
const qsA = (q) => document.querySelectorAll(q);
const show = (h, i) =>
  [h].flat().forEach((g) => (qs(g).style.display = i || "flex"));
const hide = (h) => show(h, "none");
const innerText = (i, t) => (qs(i).innerText = t);
const _ = undefined;
const error = (e) => {
  console.log(e);
  hide([".loading", ".title", ".bookContainer"]);
  show(".error");
};

const downloadPDF = async (pageData, bookName) => {
  hide([".dlButtons"]);
  show([".progress"]);

  const promises = pageData.map((url, i, a) => url2b64(url, i, a));
  const images = await Promise.all(promises);

  const doc = new jspdf.jsPDF("p", "px", [images[0].w, images[0].h]);
  images.forEach((img, index) => {
    if (index !== 0) doc.addPage("p", "px", [img.w, img.h]);
    doc.addImage(img.data, _, 0, 0, img.w, img.h);
  });
  updateProgress(100, "Saving PDF...", _, true);
  doc.save(`${bookName}.pdf`);
};

const url2b64 = (url, index, array) =>
  new Promise((resolve, reject) => {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      updateProgress((index / array.length) * 100, _, `Downloading images (%)`);
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = canvas
        .toDataURL("image/jpeg")
        .replace(/^data:image\/(png|jpg|jpeg);base64,/g, "");
      resolve({ data, w: img.width, h: img.height });
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = window.useProxy ? "https://kerboodlcors.f1shylabs.workers.dev" + (new URL(url)).pathname : url;
  });

const updateProgress = (rawP, text, dt, force) => {
  const percent = Math.ceil(rawP);

  // cover for promises and show converting if dl is 99/100%
  if (percent > 98 && !force) {
    qs(".progBar").style.width = `100%`;
    return innerText(".progText", "Converting images to PDF...");
  }

  qs(".progBar").style.width = `${percent}%`;
  innerText(".progText", dt ? dt.replace("%", percent + "%") : text);
};

const sanitise = async () => {
  // convert bookURL from query into url for kerboodle book data
  const bookURL = atob(new URLSearchParams(window.location.search).get("c"));
  const split = bookURL.split("/");
  const dataURL = split.slice(0, split.length - 1).join("/") + "/data.js";

  // get the book data and parse it as JSON
  const rawData = await (await fetch(dataURL)).text();
  const data = JSON.parse(rawData.replace("ajaxData =", "").replace("};", "}"));


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
    downloadPDF(pageData, title).catch(error)
  );
  // qs(".dlZIP").addEventListener("click", () => download(pageData, "zip", "title"));
};

window.useProxy = new URLSearchParams(window.location.search).get("useProxy") === 'true';
if (window.useProxy) Array.from(qsA(".hideUP")).forEach(i => (i.hidden = true))
sanitise().catch(error);
