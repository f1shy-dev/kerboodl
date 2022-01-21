// g=document.createElement("script");g.src="http://localhost:3000/inject.js";document.body.appendChild(g)
console.clear();
const serverURL = "http://localhost:3000/";

let inject = (url) =>
  new Promise((r, rj) => {
    const isJS = url.endsWith(".js");
    let e = document.createElement(isJS ? "script" : "link");
    !isJS && (e.type = "text/css");
    !isJS && (e.rel = "stylesheet");
    e.onload = r;
    e.onerror = rj;
    isJS ? (e.src = url) : (e.href = url);
    document.body.appendChild(e);
  });

(async () => {
  const data = await (await fetch(serverURL + "book.html")).text();
  const elem = document.createElement("div");
  elem.innerHTML = data;
  document.body.appendChild(elem);

  await inject(serverURL + "assets/output.css");
  await inject(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.0/jspdf.umd.min.js"
  );
  await inject(serverURL + "assets/app.js");
  console.log("injected");
  // alert("injected!");
})();
