document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const jokeContainer = document.getElementById('joke-container');
    const jokeText = document.getElementById('joke-text');
    const jokeAnswer = document.getElementById('joke-answer');
    const doseBtn = document.getElementById('dose-btn');
    const revealBtn = document.getElementById('reveal-btn');
    const prankBtn = document.getElementById('prank-btn');
    const statusMessage = document.getElementById('status-message');
    const currentDateSpan = document.getElementById('current-date');

    // Constants & State
    // const API_TOKEN = '...'; // Commented out

    // Jokes List (Hardcoded)
    const JOKES_LIST = [
        { joke: "Lorsqu'une consonne suit une voyelle entre 2 mots. On doit faire la liaison. Mais il y a des exceptions.", answer: 'L\'habit à papa" et "l\'achat à maman" par exemple.' },
        { joke: "Tu n'as pas besoin de parachute pour faire du parachutisme.", answer: "Cependant, tu as besoin d'un parachute si tu veux en faire deux fois." },
        { joke: "Qu'est-ce qui fait 999 fois tic et une fois toc ?", answer: "Un mille-pattes avec une jambe de bois." },
        { joke: "Mr. et Mme. Palairbiensolidecesdeuxtours ont un fils. Comment s'appele-t-il ?", answer: "Ousama" },
        { joke: "L'alcool est l'ennemi du chrétien...", answer: "Mais la bible nous enseigne d'aimer nos ennemis !" },
        { joke: "Comment appelle-t-on une douche qui n'a pas d'eau ?", answer: "Une duche." },
        { joke: "Pourquoi les canards sont-ils toujours à l'heure ?", answer: "Parce qu'ils sont dans l'étang." },
        { joke: "Pourquoi il n'y a-t-il pas de femmes en F1 ?", answer: "Sécurité routière, tous touchés, tous concernés." },
        { joke: "Qu’est-ce qu’un hamster dans l’espace ?", answer: "Un hamstéroïd." },
        { joke: "Dans la vie, 2 mots t'ouvriront beacoup de portes...", answer: "Pousser et tirer." }
    ];

    /*
    const REPLACEMENTS = {
        'homme': 'volleyeur',
        'mec': 'volleyeur',
        'gars': 'volleyeur',
        // ... (commented out)
    };
    */

    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const STORAGE_KEY_DATE = 'recovery_lab_last_dose';
    const START_DATE = new Date('2026-02-26T00:00:00'); // Start date for joke rotation

    // Initialization
    currentDateSpan.textContent = new Date().toLocaleDateString('fr-FR');
    
    // Check 24h Limit
    checkDailyLimit();

    // Easter Egg
    console.log("Mais qu'est ce que tu fais ici ? Tu sais coder en faite ? :D");

    // Button Logic
    doseBtn.addEventListener('click', fetchJoke); // Static, normal click
    revealBtn.addEventListener('click', revealAnswer);
    
    // Prank Button Logic
    prankBtn.addEventListener('mouseover', handleButtonEvasion); // Desktop
    prankBtn.addEventListener('click', handlePrankClick);     // Mobile/Action

    function revealAnswer() {
        jokeAnswer.classList.remove('hidden');
        revealBtn.classList.add('hidden');
        
        // Show the prank button now that the joke is fully revealed
        prankBtn.classList.remove('hidden');
    }

    function checkDailyLimit() {
        const lastDoseDate = localStorage.getItem(STORAGE_KEY_DATE);
        const today = new Date().toDateString();

        if (lastDoseDate === today) {
            blockAccess();
        }
    }

    function blockAccess() {
        doseBtn.style.display = 'none';
        prankBtn.style.display = 'none'; // Ensure prank button is also gone
        statusMessage.textContent = "Erreur 403 : Dose quotidienne déjà administrée. Reviens demain pour ne pas saturer tes neurones ! ;)";
        statusMessage.classList.add('text-red-600', 'font-bold');
    }

    function handleButtonEvasion(e) {
        if (attempts >= MAX_ATTEMPTS) return;

        // Ensure button is ready to move (fixed position)
        if (prankBtn.style.position !== 'fixed') {
             const rect = prankBtn.getBoundingClientRect();
             // Append to body to avoid container constraints
             document.body.appendChild(prankBtn);
             prankBtn.style.position = 'fixed';
             prankBtn.style.left = `${rect.left}px`;
             prankBtn.style.top = `${rect.top}px`;
             prankBtn.style.width = `${rect.width}px`;
             prankBtn.style.zIndex = '9999';
        }

        // Move the button randomly
        const btnWidth = prankBtn.offsetWidth;
        const btnHeight = prankBtn.offsetHeight;
        
        const maxX = window.innerWidth - btnWidth - 20;
        const maxY = window.innerHeight - btnHeight - 20;
        
        const x = Math.max(20, Math.random() * maxX);
        const y = Math.max(20, Math.random() * maxY);
        
        prankBtn.style.left = `${x}px`;
        prankBtn.style.top = `${y}px`;
        
        attempts++;
    }

    function handlePrankClick(e) {
        if (attempts < MAX_ATTEMPTS) {
            e.preventDefault();
            handleButtonEvasion(e); 
            return;
        }

        // When finally clicked
        blockAccess();
    }

    async function fetchJoke() {
        statusMessage.textContent = "Analyse des archives du labo...";
        doseBtn.disabled = true;
        doseBtn.textContent = "Traitement...";

        // Simulate processing delay for effect
        setTimeout(() => {
            try {
                const today = new Date();
                // Set times to midnight to ensure correct day calculation
                const start = new Date(START_DATE);
                start.setHours(0,0,0,0);
                today.setHours(0,0,0,0);

                const diffTime = today - start;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // If before start date, show first joke or specific message? 
                // Assuming we just clamp to 0 or modulus.
                // If negative (date before start), default to 0.
                let index = diffDays;
                
                if (index < 0) index = 0;
                
                // If we run out of jokes, loop back to the beginning or stay on last?
                // "ensuite dans l'ordre" usually implies looping or just going through.
                // We'll use modulus to loop forever.
                index = index % JOKES_LIST.length;

                const selectedJoke = JOKES_LIST[index];

                if (selectedJoke) {
                    displayJoke(selectedJoke);
                    markAsDone();
                } else {
                    throw new Error("Erreur d'indexation des blagues.");
                }

            } catch (error) {
                console.error(error);
                statusMessage.textContent = "Erreur de récupération dans les archives.";
                doseBtn.disabled = false;
                doseBtn.textContent = "Réessayer";
            }
        }, 800); // Small delay for UX
    }

    /*
    async function fetchJokeAPI() {
         // ... (Original API logic commented out)
    }

    function applyReplacements(text) {
        // ... (Commented out)
    }
    */

    function displayJoke(joke) {
        jokeContainer.classList.remove('hidden');
        jokeText.innerHTML = joke.joke.replace(/\n/g, '<br>'); // Handle newlines
        
        // Prepare answer but keep it hidden
        jokeAnswer.textContent = joke.answer;
        jokeAnswer.classList.add('hidden');
        
        // Show reveal button
        revealBtn.classList.remove('hidden');
        
        statusMessage.textContent = "Dose administrée avec succès.";
        doseBtn.style.display = 'none'; // Hide dose button
    }

    function markAsDone() {
        const today = new Date().toDateString();
        localStorage.setItem(STORAGE_KEY_DATE, today);
    }
});
