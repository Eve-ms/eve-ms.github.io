const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFmUWJ47b59r2T2OUh2rwxbsFswF7FEuGXlNxJsb78Yt-OECraxd4QrCuH3ohp0u5PRXmU-6ly_jvk/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text();


const sanitizeName = (name) => {
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};



const csvToJson = (csvString) => {
  try {
    const lines = csvString.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"' && !inQuotes) {
          inQuotes = true;
        } else if (char === '"' && inQuotes) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/\r/g, '');
        obj[header] = value;
      });
      result.push(obj);
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};

const bgColors = ["linear-gradient(0deg, rgb(255, 60, 0) 0%, rgb(255, 255, 0) 100%)"];
const json = csvToJson(csvText);

const $projets = document.querySelector(".projets");

json.forEach((item) => {
  const div = document.createElement("div");
  div.classList.add("projet");
  $projets.appendChild(div);

  const img = document.createElement("img");
  img.src = `img/${item.titre}.jpg`;
  div.appendChild(img);

  const titre = document.createElement("h2");
  titre.textContent = item.titre;
  div.appendChild(titre);

  const categories = document.createElement("div");
  categories.textContent = item.catégories;
  div.appendChild(categories);

  const description = document.createElement("p");
  description.textContent = item.description;
  div.appendChild(description);

  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    header.classList.add("fixed");

    const about = document.createElement("div");
    about.classList.add("about");

    const projets = document.querySelector(".projets");
    projets.classList.add("fixed");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);

    overlay.addEventListener("click", (e) => {
      if (e.target === fiche || fiche.contains(e.target)) return;
      gsap.to(overlay, { opacity: 0, duration: 0.2, onComplete: () => overlay.remove() });
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });

    const img = document.createElement("img");
    img.src = `img/${item.titre}.jpg`;
    fiche.appendChild(img);

    const titre = document.createElement("h2");
    titre.textContent = item.titre;
    fiche.appendChild(titre);

    const desc = document.createElement("desc");
    desc.innerHTML = item.modale;
    fiche.appendChild(desc);

    if (item.images !== "") {
      const images = item.images.split(",");
      const gallery = document.createElement("div");
      gallery.classList.add("gallery");
      images.forEach((image) => {
        const img = document.createElement("img");
        const name = sanitizeName(item.titre);
        img.src = `img/${name}/${image}`;
        gallery.appendChild(img);
      });
      fiche.appendChild(gallery);
    }
    });
  });

  const aboutButton = document.querySelector("header .about");
  aboutButton.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay1");
    overlay.style.backgroundColor = "rgb(132, 0, 0)";
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const content = document.createElement("div");
    content.classList.add("content");
    content.innerHTML = `<h2>About</h2>
    <br>
    <p>This is the about section content.</p>`;
    wrap.appendChild(content);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    wrap.appendChild(close);

    close.addEventListener("click", () => {
      gsap.to(overlay, { opacity: 0, duration: 0.2, onComplete: () => overlay.remove() });
    });

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  });
  

  /******* */

  const allProjets = document.querySelectorAll(".projet");

  // Set up hover effects for projects
  allProjets.forEach((projet, index) => {
    const img = projet.querySelector("img");
    const textElements = projet.querySelectorAll("h2, p, div:not(.gallery)");

    if (img && textElements.length > 0) {
      // Initially hide the image and center the text
      gsap.set(img, { opacity: 0 });
      gsap.set(textElements, { opacity: 1, display: "flex", justifyContent: "center", alignItems: "center" });

      projet.addEventListener("mouseenter", () => {
        // On hover, hide the text and show the image with scaling effect
        gsap.to(textElements, { opacity: 0, duration: 0.2 });
        gsap.to(img, { opacity: 1, scale: 0.5, duration: 0.5 });
        // Dim other projects
        allProjets.forEach((otherProjet, otherIndex) => {
          if (otherIndex !== index) gsap.to(otherProjet, { opacity: 0.2, duration: 0.7 });
        });
      });

      projet.addEventListener("mouseleave", () => {
        // Restore text and hide the image
        gsap.to(textElements, { opacity: 1, duration: 0.5 });
        gsap.to(img, { opacity: 0, scale: 0, duration: 0.5 });
        // Restore opacity of other projects
        allProjets.forEach((otherProjet) => gsap.to(otherProjet, { opacity: 1, duration: 0.5 }));
      });
    }

    // Add floating animation
    const timeline = gsap.timeline({ repeat: -1, yoyo: true, delay: index * 0.5 });
    timeline.to(projet, { y: 100, duration: 1, ease: "power1.inOut" }).to(projet, { y: 0, duration: 1, ease: "power1.inOut" });

    projet.addEventListener("mouseenter", () => timeline.pause());
    projet.addEventListener("mouseleave", () => timeline.resume());
  });

  // Add dynamic background
  const dynamicBg = document.createElement("div");
  dynamicBg.classList.add("dynamic-bg");
  document.body.appendChild(dynamicBg);

  gsap.set(dynamicBg, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    background: "rgb(180, 0, 0)",
    opacity: 1,
  });

  allProjets.forEach((projet) => {
    projet.addEventListener("mouseenter", () => {
      const rect = projet.getBoundingClientRect();
      const gradient = `radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, rgb(234, 255, 0) 0%, rgb(180, 0, 0) 80%)`;
      gsap.to(dynamicBg, { background: gradient, duration: 0, ease: "power2.inOut" });
    });

    projet.addEventListener("mouseleave", () => {
      gsap.to(dynamicBg, { background: "rgb(180, 0, 0)", duration: 0, ease: "power2.inOut" });
    });
  });

  // Add scaling, hover effects, and trail to projects
  allProjets.forEach((projet) => {
    const gradient = `radial-gradient(ellipse at center, #40E0D0, rgba(64, 224, 208, 0))`;
    gsap.to(projet, { background: gradient, duration: 0.5, ease: "power1.inOut" });

    const sizeTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    sizeTimeline.to(projet, { scale: 1.1, duration: 1.5, ease: "power1.inOut" }).to(projet, { scale: 1, duration: 1.5, ease: "power1.inOut" });

  });

// Add text trail effect to project divs without impacting the text
allProjets.forEach((projet) => {
  const createTrail = () => {
    const trail = projet.cloneNode(true);
    trail.style.position = "absolute";
    trail.style.pointerEvents = "none";
    trail.style.opacity = 1;
    trail.style.transform = getComputedStyle(projet).transform;
    trail.style.zIndex = -1;
    trail.innerHTML = ""; // Remove inner content to avoid impacting text
    document.body.appendChild(trail);

    const rect = projet.getBoundingClientRect();
    gsap.set(trail, {
      top: rect.top + window.scrollY + 10, // Adjusted position
      left: rect.left + window.scrollX + 5, // Adjusted position
      width: rect.width + "px",
      height: rect.height + "px",
      background: "rgba(221, 255, 0, 0.06)", // Modified color
      borderRadius: getComputedStyle(projet).borderRadius,
    });

    gsap.to(trail, { opacity: 0, duration: 1.5, onComplete: () => trail.remove() });
  };

  const timeline = gsap.timeline({ repeat: -1, yoyo: true, delay: Math.random() * 2 });
  timeline.to(projet, { scale: 1, duration: 1, ease: "power1.inOut", onUpdate: createTrail });
});


