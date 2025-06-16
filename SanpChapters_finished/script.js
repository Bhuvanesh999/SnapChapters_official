  let extractedText = "";
  const summaryBtn = document.getElementById('summarize-btn');
  const outputDiv = document.getElementById('summary-output');
  const pdfTextDiv = document.getElementById('pdf-text');
  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const continueBtn = document.getElementById('after-summary-btn');
  const quizBtn = document.getElementById('quiz-unlock-btn');

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
          continueBtn.style.display = 'none';
          quizBtn.style.display = 'none';
        });
      });
    };
    reader.readAsArrayBuffer(file);
  });

  summaryBtn.addEventListener('click', function () {
    const fileName = fileInput.files[0]?.name || "";
    summaryBtn.style.display = 'none';

    if (fileName === "Civics_ch1.pdf") {
      outputDiv.innerHTML = `<h3>📌 Summary of Power-Sharing:</h3>
        <ul>
          <li>Power-sharing prevents concentration of power and promotes stability.</li>
          <li><strong>Belgium:</strong> Shared power among communities.</li>
          <li><strong>Sri Lanka:</strong> Majoritarianism led to conflict.</li>
          <li>Forms: Between branches, levels, and communities.</li>
        </ul>`;
    } else {
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
    }

    outputDiv.style.display = 'block';
    outputDiv.classList.add('fade-in');
    continueBtn.style.display = 'inline-block';
  });

  continueBtn.addEventListener('click', function () {
    continueBtn.classList.add("animate");

    setTimeout(() => {
      continueBtn.classList.remove("animate");

      outputDiv.innerHTML = `
        <h3>🎵 You've been Rickrolled!</h3>
        <video id="final-video" width="560" height="315" controls autoplay>
          <source src="rickroll.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
      outputDiv.style.display = 'block';

      // Attach 'ended' event listener after video loads
      setTimeout(() => {
        const finalVideo = document.getElementById('final-video');
        if (finalVideo) {
          finalVideo.addEventListener('ended', function () {
            quizBtn.style.display = 'inline-block';
          });
        }
      }, 100);
    }, 600);
  });

  quizBtn.addEventListener('click', function () {
    window.location.href = "quiz.html";
  });

  // Drag & Drop support
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