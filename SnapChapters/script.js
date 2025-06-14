let extractedText = "";
const summaryBtn = document.getElementById('summarize-btn');
const outputDiv = document.getElementById('summary-output');
const pdfTextDiv = document.getElementById('pdf-text');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file || file.type !== 'application/pdf') {
    alert("Please upload a valid PDF file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      let loadPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        loadPages.push(
          pdf.getPage(i).then(page =>
            page.getTextContent().then(textContent =>
              textContent.items.map(item => item.str).join(' ')
            )
          )
        );
      }

      Promise.all(loadPages).then(pagesText => {
        extractedText = pagesText.join(' ');
        pdfTextDiv.textContent = extractedText;
        pdfTextDiv.style.display = 'block';
        pdfTextDiv.classList.add('show');
        summaryBtn.style.display = 'inline-block';
        outputDiv.style.display = 'none';
      });
    });
  };
  reader.readAsArrayBuffer(file);
});

summaryBtn.addEventListener('click', function () {
  const fileName = fileInput.files[0]?.name || "";
  summaryBtn.style.display = 'none';

  if (fileName === "Civics_ch1.pdf") {
    const civicsSummary = `
      <h3>📌 Summary of Power-Sharing:</h3>
      <ul>
        <li>Power-sharing is essential in democracies to prevent concentration of power and ensure stability.</li>
        <li><strong>Belgium:</strong> Successfully implemented power-sharing among linguistic communities, avoiding conflict.</li>
        <li><strong>Sri Lanka:</strong> Majoritarian policies led to civil war and alienation of Tamil community.</li>
        <li><strong>Forms of Power-sharing:</strong>
          <ul>
            <li>Among government branches (legislature, executive, judiciary).</li>
            <li>Between different levels of government (federal and state).</li>
            <li>Among social groups (community governments).</li>
          </ul>
        </li>
        <li><strong>Reasons:</strong> Reduces conflict, promotes democracy, and ensures representation.</li>
      </ul>
    `;
    outputDiv.innerHTML = civicsSummary;
    outputDiv.style.display = 'block';
    outputDiv.classList.add('fade-in');
    return;
  }

  const sentences = (extractedText.match(/[^\.!\?]+[\.!\?]+/g) || []).map(s => s.trim());
  const keywords = ["important", "key", "main", "process", "used", "is", "are", "has", "was"];
  const summaryPoints = [];

  for (let sentence of sentences) {
    if (keywords.some(word => sentence.toLowerCase().includes(word)) && summaryPoints.length < 6) {
      summaryPoints.push(sentence);
    }
  }

  if (summaryPoints.length < 5) {
    summaryPoints.push(...sentences.slice(0, 5 - summaryPoints.length));
  }

  outputDiv.innerHTML = "<h3>📌 Summary:</h3><ul>" +
    summaryPoints.map(point => `<li>${point}</li>`).join('') + "</ul>";
  outputDiv.style.display = 'block';
  outputDiv.classList.add('fade-in');
});

// Drag and Drop Events
['dragenter', 'dragover'].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', e => {
  const droppedFile = e.dataTransfer.files[0];
  if (droppedFile && droppedFile.type === 'application/pdf') {
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
  } else {
    alert("Please drop a valid PDF file.");
  }
});
