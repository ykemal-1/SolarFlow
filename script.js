const WEBHOOK_URL =
    "https://solarflow2.app.n8n.cloud/webhook/4066943f-3fb7-406d-bd2f-808d9d3a03c6";

const form = document.getElementById("offerteForm");
const fileInput = document.getElementById("foto");
const dropzone = document.getElementById("dropzone");
const dropText = document.getElementById("dropText");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

// Show the chosen file name in the drop zone
function showFileName() {
    const file = fileInput.files[0];
    dropText.innerHTML = file
        ? `${file.name} (<u>wijzigen</u>)`
        : "Sleep een bestand hierheen of <u>blader</u>";
}

fileInput.addEventListener("change", showFileName);

// Drag & drop
["dragenter", "dragover"].forEach((type) =>
    dropzone.addEventListener(type, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    }),
);

["dragleave", "drop"].forEach((type) =>
    dropzone.addEventListener(type, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
    }),
);

dropzone.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        showFileName();
    }
});

// Mark empty required fields red
function validate() {
    let valid = true;
    form.querySelectorAll("input[required]").forEach((input) => {
        const ok = input.checkValidity();
        input.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
    });
    return valid;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.className = "";

    if (!validate()) {
        statusEl.textContent = "Vul alle verplichte velden correct in.";
        statusEl.className = "error";
        return;
    }

    // FormData sends every field + the image as multipart/form-data
    const data = new FormData(form);
    data.set(
        "telefoon",
        `${data.get("landcode")} ${data.get("telefoon")}`.trim(),
    );
    data.delete("landcode");
    if (!fileInput.files.length) data.delete("foto");

    submitBtn.disabled = true;
    statusEl.textContent = "Bezig met verzenden...";

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            body: data,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        statusEl.textContent = "Bedankt! Uw aanvraag is verzonden.";
        statusEl.className = "ok";
        form.reset();
        showFileName();
    } catch (err) {
        statusEl.textContent = `Verzenden mislukt (${err.message}). Probeer opnieuw.`;
        statusEl.className = "error";
    } finally {
        submitBtn.disabled = false;
    }
});
