const url = `${document
  .querySelector("#interaction")
  .src.split("/")
  .slice(0, 11)
  .join("/")}/data.js`;

document.body.appendChild(document.createElement("div")).innerHTML =
  '<iframe id="frame" style="display:none"></iframe>';

const iwind = document.querySelector("#frame").contentWindow;


const parser = new DOMParser();
const doc = parser.parseFromString(
  ajaxData[Object.keys(ajaxData)[1]],
  "text/xml"
);
let cIDs = [];
const pages = Array.from(doc.querySelector("pages").children);
pages.forEach((t) => cIDs.push(t.getAttribute("url").split("/")[4])),
  (cIDs = [...new Set(z)]);
const pageNums = [];
pages.forEach((i) => {
  const e = i.getAttribute("url").split("/");
  pageNums.push(`${cIDs.indexOf(e[4])}/${e[6]}`);
});
const baseURL =
  pages[0].getAttribute("url").split("/").slice(2, 4).join("/") + "/";

console.log({
  cIDs,
  pageNums,
  baseURL,
});
