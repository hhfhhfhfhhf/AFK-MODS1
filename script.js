
const updateBtn = document.getElementById('updateBtn');
const convertBtn = document.getElementById('convertBtn');
const telegramBtn = document.getElementById('telegramBtn');
const fileInput = document.getElementById('fileInput');
const log = document.getElementById('log');

telegramBtn.onclick = () => {
  window.open("https://t.me/vocksXsenpai", "_blank");
};

updateBtn.onclick = () => {
  log.innerText = "يرجى اختيار مود Bedrock...";
  fileInput.accept = ".zip,.mcaddon";
  fileInput.onchange = handleUpdate;
  fileInput.click();
};

convertBtn.onclick = () => {
  log.innerText = "يرجى اختيار مود Java (.zip أو .jar)...";
  fileInput.accept = ".zip,.jar";
  fileInput.onchange = handleConvert;
  fileInput.click();
};

function handleUpdate(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const zip = await JSZip.loadAsync(e.target.result);
    let manifestFile;

    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.endsWith("manifest.json") && !manifestFile)
        manifestFile = zipEntry;
    });

    if (!manifestFile) {
      log.innerText = "لم يتم العثور على manifest.json داخل المود.";
      return;
    }

    const manifestText = await manifestFile.async("string");
    let manifest;
    try {
      manifest = JSON.parse(manifestText);
    } catch (err) {
      log.innerText = "manifest.json غير صالح.";
      return;
    }

    manifest.header.version = [1, 0, 0];
    manifest.header.min_engine_version = [1, 22, 0];
    manifest.header.author = "By Sung Jin woo";

    zip.file(manifestFile.name, JSON.stringify(manifest, null, 2));
    zip.file("credits.txt", "By Sung Jin woo");

    const newBlob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(newBlob);
    a.download = "updated_mod.mcaddon";
    a.click();
    log.innerText = "✅ تم تحديث المود!";
  };

  reader.readAsArrayBuffer(file);
}

function handleConvert(event) {
  const file = event.target.files[0];
  if (!file) return;

  log.innerText = "جارٍ تحويل مود Java إلى Bedrock (تجريبي)...";

  const zip = new JSZip();
  zip.file("behavior_packs/java_mod/manifest.json", JSON.stringify({
    "format_version": 2,
    "header": {
      "name": "Java Converted Mod",
      "description": "تحويل من Java إلى Bedrock",
      "uuid": self.crypto.randomUUID(),
      "version": [1, 0, 0],
      "min_engine_version": [1, 22, 0],
      "author": "By Sung Jin woo"
    },
    "modules": [{
      "type": "data",
      "uuid": self.crypto.randomUUID(),
      "version": [1, 0, 0]
    }]
  }, null, 2));

  zip.file("credits.txt", "Converted by AFK MODS");

  zip.generateAsync({ type: "blob" }).then(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "converted_mod.mcaddon";
    a.click();
    log.innerText = "✅ تم التحويل!";
  });
}
