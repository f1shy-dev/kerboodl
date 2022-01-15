// helper things to reduce long repeated lines
const qs = (q) => document.querySelector(q);
const show = (h, i) =>
  [h].flat().forEach((g) => (qs(g).style.display = i || "flex"));
const hide = (h) => show(h, "none");
const innerText = (i, t) => (qs(i).innerText = t);

const app = async () => {
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
  const pages = rawPages.map((elem) => elem.children[0].innerHTML);

  qs(".bookImg").src = pages[0];
  innerText(".bookTitle", doc.querySelector("title").innerHTML);
  innerText(".bookID", "#" + doc.querySelector("ID").innerHTML);
  hide(".loading");
  show(".bookContainer");
};

app().catch((e) => {
  console.log(e);
  hide([".loading", ".title", ".bookContainer"]);
  show(".error");
});
