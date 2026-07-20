// Services data
        const serviceData = {
            consultations: {
                title: "Consultations",
                icon: "🏥",
                subtitle: "Médecine générale et interne",
                description: "La consultation est le pilier de la santé de votre animal. Après la prise en compte de l'historique et de l'anamnèse, lors de chaque visite, le vétérinaire réalise un examen clinique exhaustif. Nous nous engageons à répondre à l'ensemble de vos questions. Chaque animal bénéficie d'un dossier médical informatisé permettant un suivi chronologique précis et une transmission sécurisée des informations entre les vétérinaires de l'équipe.",
                includes: [
                    "Examen clinique exhaustif",
                    "Contrôle du poids et condition corporelle",
                    "Conseils personnalisés",
                    "Dossier médical informatisé et suivi chronologique",
                    "Propositions des options thérapeutiques adaptées à chaque situation",
                    "Nous proposons également des consultations dans nos domaines de compétences spécifiques : ophtalmologie, orthopédie, cardiologie, comportement"

                ],
                duration: "20 à 60 minutes selon le motif de consultation",
                price: "À partir de 45€",
                availability: "Lundi au Samedi, sur rendez-vous"
            },
            vaccinations: {
                title: "Vaccinations",
                icon: "💉",
                subtitle: "Médecine préventive selon les protocoles vaccinaux en cours de validité",
                description: "La vaccination reste le meilleur moyen de protéger votre animal contre les maladies infectieuses graves. Nous suivons scrupuleusement les recommandations du Groupe d'Étude en Pathologie Infectieuse du BSAVA et de l'AFVAC. Chaque protocole est personnalisé selon l'âge, le mode de vie (intérieur/extérieur, voyages) et l'état de santé de votre compagnon.",
                includes: [
                    "Protocole vaccinal personnalisé selon l'espèce et le mode de vie de l'animal",
                    "Examen clinique pré vaccinal exhaustif et systématique",
                    "Carnet de vaccination",
                    "Rappels personnalisés par email/SMS"
                ],
                duration: "15 à 20 minutes",
                price: "À partir de 59€ (vaccin + consultation)",
                availability: "Lundi au Samedi, sur rendez-vous"
            },
            chirurgie: {
                title: "Chirurgie",
                icon: "🔬",
                subtitle: "Bloc opératoire moderne",
                description: "La clinique vétérinaire Sancéa Vet dispose de deux blocs opératoires équipés de matériel de pointe (appareil d'anesthésie gazeuse, monitoring multi-paramétrique, lampe scialytique, microscope opératoire, ...). Les interventions chirurgicales sont réalisées sous anesthésie générale selon un protocole personnalisé et optimisé pour chaque patient. Chaque animal reçoit également une prise en charge continue de la douleur spécifique à sa condition physique et à son intervention pendant et après la chirurgie.",
                includes: [
                    "Anesthésie générale avec monitoring multi-paramétrique",
                    "Gestion personnalisée de la douleur selon les protocoles actuels",
                    "Chirurgie dite de convenance : stérilisation mâles et femelles",
                    "Chirurgie des tissus mous : exérèse de masse, exérèse de tumeurs, biopsies, chirurgies abdominales, ...",
                    "Chirurgie ophtalmologique : chirurgie des paupières, greffe cornéenne",
                    "Chirurgie d'urgence : hémorragie interne, éventration, syndrome dilatation torsion de l'estomac, césarienne,...",
                    "Chirurgie orthopédique : fracture, luxation, rupture des ligaments croisés, ...",
                    "Hospitalisation post opératoire sous surveillance"
                ],
                duration: "Variable selon l'intervention",
                price: "Devis personnalisé sur consultation",
                availability: "Lundi au Vendredi (programmées), astreinte (urgences)"
            },
            dentisterie: {
                title: "Dentisterie",
                icon: "🦷",
                subtitle: "Soins bucco-dentaires complets",
                description: "Nous réalisons : détartrage, polissage et extractions dentaires quand cela est nécessaire. Les soins sont réalisés sous anesthésie générale avec une analgésie adaptée.",
                includes: [
                    "Détartrage à ultrasons sous anesthésie",
                    "Polissage et fluoridation",
                    "Extractions chirurgicales si nécessaire",
                    "Traitement des abcès et fistules",
                    "Conseils d'hygiène dentaire à domicile"
                ],
                duration: "45 à 90 minutes (sous anesthésie)",
                price: "À partir de 180€",
                availability: "Du lundi au vendredi, sur rendez-vous"
            },
            imagerie: {
                title: "Imagerie Médicale",
                icon: "🩺",
                subtitle: "Diagnostic par l'image de haute précision",
                description: "La clinique vétérinaire Sancéa Vet dispose d'un plateau technique d'imagerie avancé, fiable et performant. Nous possédons une radiographie numérique permettant la réalisation de tous types de clichés radiographiques : thorax, abdomen, segments osseux, rachis, crâne, ... Nous disposons également d'un échographe récent et performant permettant la réalisation des échographies cardiaques, thoraciques et abdominales. Nous proposons également la réalisation de cytoponctions et de biopsies échoguidées. Ces équipements permettent un diagnostic rapide et précis des affections thoraciques, abdominales, orthopédiques et cardiaques, directement sur place sans déplacement stressant.",
                includes: [
                    "Radiographie numérique DR (thorax, abdomen, os)",
                    "Échographie abdominale et cardiaque (Doppler)",
                    "Compte-rendu détaillé avec images",
                    "Transmission aux spécialistes externes si besoin"
                ],
                duration: "20 à 60 minutes",
                price: "Radio à partir de 65€, Échographie à partir de 85€",
                availability: "Lundi au Samedi, sur rendez-vous ou lors de consultations"
            },
            urgences: {
                title: "Urgences & astreinte",
                icon: "🚑",
                subtitle: "Service d'astreinte en dehors des horaires d'ouverture",
                description: "En dehors des horaires d'ouverture, la continuité des soins est assurée par un vétérinaire d'astreinte joignable par téléphone, pour nos patients comme pour les animaux sans vétérinaire traitant. Il s'agit d'une astreinte téléphonique : aucun vétérinaire n'est présent en permanence sur place, il est donc indispensable d'appeler avant tout déplacement. En cas d'urgence, contactez en priorité votre vétérinaire traitant, qui vous orientera vers la solution de prise en charge la plus adaptée. La clinique vétérinaire Sancéa Vet est équipée pour la prise en charge de tous types d'urgences : traumatismes, détresse respiratoire, intoxications, convulsions, ...",
                includes: [
                    "Tri et évaluation vitale immédiate",
                    "Oxygénothérapie et réanimation cardio-pulmonaire",
                    "Perfusion et stabilisation",
                    "Sutures et traitement des plaies",
                    "Liaison avec centres de référence si spécialisation requise"
                ],
                duration: "adaptée à la situation d'urgence",
                price: "Consultation urgences en journée : 55€<br>Consultation urgences nuit / week-end / jour férié : à partir de 120€",
                availability: "En dehors des horaires d'ouverture — astreinte téléphonique, appeler avant tout déplacement"
            }
        };

        // Team members data
        const teamData = {
            adrien: {
                name: "Dr. Adrien Le Leuch",
                role: "Médecine interne & cardiologie",
                image: "assets/img/adrien-le-leuch-veterinaire.jpg",
                tags: ["Médecine Générale", "Médecine interne", "Cardiologie", "CEAV Médecine interne"],
                bio: "Le Dr. Adrien Le Leuch a pour domaines de compétence la médecine interne et la cardiologie vétérinaire. Diplômé du CEAV de médecine interne, il accompagne les cas complexes avec une expertise diagnostic poussée et un suivi médical précis. Sa pratique se concentre sur les maladies cardiaques, métaboliques et inflammatoires des petits animaux.",
                diplomas: [
                    { year: "2023", name: "CEAV de médecine interne des animaux de compagnie" },
                    { year: "2014", name: "Doctorat en Médecine Vétérinaire", school: "ENVT" }
                ],
                specialties: "Cardiologie vétérinaire, médecine interne, maladies métaboliques, suivi de l'insuffisance cardiaque, diagnostics complexes et gestion des pathologies chroniques."
            },
            maxime: {
                name: "Dr. Maxime Bousses",
                role: "Médecine et chirurgie orthopédiques",
                image: "assets/img/maxime-bousses-veterinaire.jpg",
                tags: ["Médecine Générale", "Chirurgie", "Orthopédie", "Traumatologie"],
                bio: "Le Dr. Maxime Bousses a pour domaines de compétence les interventions chirurgicales et les traumatismes ostéo-articulaires. Diplômé du CES Traumatologie ostéo-articulaire et orthopédie animale, il maîtrise les techniques chirurgicales les plus avancées pour restaurer la mobilité et le confort des animaux.",
                diplomas: [
                    { year: "2018", name: "CES Traumatologie ostéo-articulaire et orthopédie animale" },
                    { year: "2014", name: "Doctorat en Médecine Vétérinaire", school: "ENVT" }
                ],
                specialties: "Chirurgie orthopédique, prise en charge des fractures, traumatologie ostéo-articulaire, prothèses et fixateurs externes, réhabilitation post-opératoire."
            },
            lucie: {
                name: "Dr. Lucie Lengellé",
                role: "Médecine, échographie et comportement",
                image: "assets/img/lucie-lengelle-veterinaire.jpg",
                tags: ["Médecine Générale", "CEAV de Médecine du comportement des animaux domestiques"],
                bio: "Le Dr Lucie Lengellé a un attrait particulier pour la médecine, la prise en charge des animaux hospitalisés et l'échographie abdominale. Titulaire du CEAV Médecine du comportement des animaux domestiques, elle aide les propriétaires à comprendre et modifier les comportements indésirables grâce à des protocoles personnalisés et respectueux du bien-être animal.",
                diplomas: [
                    { year: "2015", name: "CEAV Médecine du comportement des animaux domestiques"},
                    { year: "2011", name: "Doctorat en Médecine Vétérinaire", school: "ENVA" }
                ],
                specialties: "Médecine, échographie abdominale, diagnose de race, évaluation comportementale."
            },
            alexis: {
                name: "Dr. Alexis Racine",
                role: "Médecine ophtalmologique",
                image: "assets/img/alexis-racine-veterinaire.jpg",
                tags: ["Médecine Générale", "Ophtalmologie", "Chirurgie oculaire"],
                bio: "Le Dr Alexis Racine exerce une activité dédiée à l'ophtalmologie vétérinaire. Titulaire d'un Diplôme d'École (DE) d'Ophtalmologie, il assure le diagnostic et le traitement des maladies oculaires des petits animaux, en médecine comme en chirurgie. Son activité couvre notamment les ulcères cornéens, les glaucomes, les anomalies palpébrales, les affections de la surface oculaire et les traumatismes de l'œil.",
                diplomas: [
                    { year: "2017", name: "DE d'Ophtalmologie" },
                    { year: "2014", name: "Doctorat en Médecine Vétérinaire", school: "ENVA" }
                ],
                specialties: "Examens oculaires approfondis, chirurgie ophtalmologique, prise en charge des infections et inflammations oculaires, gestion des glaucomes et des troubles de la vision, consultations de suivi post-opératoire."
            }
        };

        // Modal functions
        function openModal(memberId) {
            const data = teamData[memberId];
            if (!data) return;

            document.getElementById('modalImg').src = data.image;
            document.getElementById('modalImg').alt = `${data.name}, ${data.role} à la clinique vétérinaire Sancéa Vet`;
            document.getElementById('modalName').textContent = data.name;
            document.getElementById('modalRole').textContent = data.role;
            document.getElementById('modalBio').textContent = data.bio;
            document.getElementById('modalSpecialties').textContent = data.specialties;

            // Tags
            const tagsContainer = document.getElementById('modalTags');
            tagsContainer.innerHTML = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            // Diplomas
            const diplomasContainer = document.getElementById('modalDiplomas');
            diplomasContainer.innerHTML = data.diplomas.map(dip => `
                <li>
                    <span class="year">${dip.year}</span>
                    <div>
                        <div class="dip-name">${dip.name}</div>
                        ${dip.school ? `<div class="dip-school">${dip.school}</div>` : ''}
                    </div>
                </li>
            `).join('');

            document.getElementById('teamModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('teamModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        // Service Modal functions
        function openServiceModal(serviceId) {
            const data = serviceData[serviceId];
            if (!data) return;

            document.getElementById('serviceModalIcon').textContent = data.icon;
            document.getElementById('serviceModalTitle').textContent = data.title;
            document.getElementById('serviceModalSubtitle').textContent = data.subtitle;
            document.getElementById('serviceModalDesc').textContent = data.description;

            // Includes
            const includesContainer = document.getElementById('serviceModalIncludes');
            includesContainer.innerHTML = data.includes.map(item => `
                <li>
                    <span class="year" style="background: var(--primary); color: white;">✓</span>
                    <div>
                        <div class="dip-name">${item}</div>
                    </div>
                </li>
            `).join('');

            // Info grid
            const infoContainer = document.getElementById('serviceModalInfo');
            infoContainer.innerHTML = `
                <div class="service-info-item">
                    <div class="label">Durée</div>
                    <div class="value">${data.duration}</div>
                </div>
                <div class="service-info-item">
                    <div class="label">Tarif indicatif</div>
                    <div class="value">${data.price}</div>
                </div>
                <div class="service-info-item">
                    <div class="label">Disponibilité</div>
                    <div class="value">${data.availability}</div>
                </div>
            `;

            document.getElementById('serviceModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeServiceModal(event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('serviceModal').classList.remove('active');
            document.body.style.overflow = '';
        }



        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeServiceModal();
        closeArticleModal();  // ← ajouter cette ligne
    }
});

        // Mobile menu toggle
        function toggleMenu() {
            document.getElementById('navLinks').classList.toggle('active');
        }

        // Close menu on link click
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                document.getElementById('navLinks').classList.remove('active');
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
            }
        });

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Chargement au clic des contenus tiers (RGPD)
        // Aucun appel au service externe tant que le visiteur n'a pas cliqué :
        // le clic vaut consentement pour ce service, ce qui évite un bandeau global.
        // Usage : <div class="embed-consent" data-embed-src="..." data-embed-title="...">
        document.querySelectorAll('.embed-consent').forEach(placeholder => {
            const button = placeholder.querySelector('.embed-consent-btn');
            if (!button) return;

            button.addEventListener('click', () => {
                const iframe = document.createElement('iframe');
                iframe.src = placeholder.dataset.embedSrc;
                iframe.title = placeholder.dataset.embedTitle || 'Contenu externe';
                iframe.loading = 'lazy';
                iframe.referrerPolicy = 'no-referrer-when-downgrade';
                iframe.allowFullscreen = true;
                placeholder.replaceWith(iframe);
            });
        });