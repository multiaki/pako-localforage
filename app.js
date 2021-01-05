const markerNameA = "example-marker-a"
const markerNameB = "example-marker-b"
const markerNameC = "example-marker-c"
const markerNameD = "example-marker-d"
const loader = document.getElementById('loader');
let appHtml = document.getElementById('main');

function hideLoader() {
  appHtml.classList.remove("loader");
}

function showLoader() {
  appHtml.classList.add("loader");
}

function saveCache() {
  showLoader()
  console.log("Started Loading")
  fetch('./data.json')
    .then(response => response.json())
    .then(data => {
      data = Array.from({length: 10}, (_, i) => JSON.parse(JSON.stringify(data)))
      performance.mark(markerNameA);
      data = new TextEncoder().encode(JSON.stringify(data));
      performance.mark(markerNameB);
      performance.measure("JSON to Uint8Array", markerNameA, markerNameB);
      data = zipFile(data)
      performance.mark(markerNameC);
      performance.measure("ZipFile performance", markerNameB, markerNameC);
      localforage.setItem('data', data);
      performance.mark(markerNameD);
      performance.measure("SetItem performance", markerNameC, markerNameD);
      console.log("Done saving Localforage data")
      hideLoader()
    })
}

async function getStorageData() {
  console.log("Getting storage data")
  showLoader()
  performance.mark(markerNameA);
  let data
  try {
    data = await localforage.getItem('data')
    performance.mark(markerNameB);
    performance.measure("GetItem performance", markerNameA, markerNameB);
    data = unzipFile(data)
    performance.mark(markerNameC);
    performance.measure("UnzipFile performance", markerNameB, markerNameC);
    data = JSON.parse(new TextDecoder("utf-8").decode(data))
    performance.mark(markerNameD);
    performance.measure("Uint8Array to String performance", markerNameC, markerNameD);
    console.log(performance.getEntriesByType("measure"));
    appHtml.innerHTML = (data[0])
  } catch (e) {
    throw e;
  }
  console.log("Done getting storage data")
  hideLoader()
}

function zipFile(data) {
  return pako.deflate(data, {level: 6})
}

function unzipFile(data) {
  return pako.inflate(data, {level: 6})
}

saveCache()
