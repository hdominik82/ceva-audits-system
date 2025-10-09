// KONFIGURACJA SYSTEMU AUDYTÓW CEVA
// Wersja: 2.1 - Multi-branch z danymi z Excel
// Ostatnia aktualizacja: 2025-10-09

const CEVA_CONFIG = {
    // SharePoint URLs
    sharePointSite: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
    sharePointDocuments: 'Shared%20Documents',
    
    // Generowanie pełnego URL do folderu SharePoint
    getSharePointFolderUrl: function(branchCode, folderType) {
        const branch = this.branches[branchCode];
        if (!branch) return this.sharePointSite;
        
        const folderName = this.folders[folderType];
        return `${this.sharePointSite}/${this.sharePointDocuments}/Forms/AllItems.aspx?id=%2Fsites%2FAuditTool%2F${this.sharePointDocuments}%2F${branch.sharePointFolder}%2F${folderName}`;
    },
    
    // Nazwy folderów SharePoint (standard dla wszystkich oddziałów)
    folders: {
        fiveS: '5S',
        gemba: 'Gemba',
        process: 'Process',
        problems: 'Problems'
    },
    
    // Konfiguracja oddziałów
    branches: {
        'ORA-PL-01': {
            code: 'ORA-PL-01',
            name: 'Orange',
            country: 'PL',
            fullName: 'CEVA Orange Poland',
            sharePointFolder: 'ORA-PL-01_Orange',
            
            // Strefy/obszary w oddziale z audytorami 5S
            zones: [
                {id: 1, name: 'B2C', responsible: 'Jan Surwilo', target: 90, auditor5S: 'PAWEŁ ADAMCZYK'},
                {id: 2, name: 'B2B', responsible: 'Dominik Harezlak', target: 90, auditor5S: 'NATALIA FUDAŁA'},
                {id: 3, name: 'ZWROTY', responsible: 'Mariusz Maciąg', target: 90, auditor5S: 'MONIKA SOCHA'},
                {id: 4, name: 'ODNOWA', responsible: 'Konrad Kasinski', target: 90, auditor5S: 'JOANNA KEMPCZYŃSKA'},
                {id: 5, name: 'PRZYJĘCIA/ VAS', responsible: 'Jan Surwilo', target: 90, auditor5S: 'ANNA KAPLER'},
                {id: 6, name: 'ZEWNĄTRZ BUDYNKU', responsible: 'Piotr Żebrowski', target: 90, auditor5S: 'PIOTR ŻEBROWSKI'},
                {id: 7, name: 'ŚREDNI WYNIK MAGAZYNU', responsible: 'Jan Surwilo', target: 90, auditor5S: 'JAN SURWIŁO'}
            ],
            
            // Lista audytorów (do audytów Process i problemów)
            auditors: [
                'Jan Surwilo',
                'Konrad Kasinski',
                'Mariusz Maciąg',
                'Dominik Harezlak',
                'Patryk Krzeminski',
                'Piotr Żebrowski'
            ],
            
            // Lista audytorów 5S
            auditors5S: [
                'PAWEŁ ADAMCZYK',
                'NATALIA FUDAŁA',
                'MONIKA SOCHA',
                'JOANNA KEMPCZYŃSKA',
                'ANNA KAPLER',
                'PIOTR ŻEBROWSKI',
                'JAN SURWIŁO'
            ],
            
            // Uczestnicy GEMBA Walk według poziomów
            gembaParticipants: {
                level1: [
                    {name: 'Brygadzista B2C', email: 'wydania.skladanie@cevalogistics.com'},
                    {name: 'Brygadzista B2B', email: 'Wydania.Realizacja@Cevalogistics.com'},
                    {name: 'Brygadzista Zwrotów', email: 'ptk.zwroty@cevalogistics.com'},
                    {name: 'Brygadzista Odnowy', email: 'kamil.markowski@cevalogistics.com'},
                    {name: 'Brygadzista Odnowy', email: 'marcin.borysiak@cevalogistics.com'}
                ],
                level2: [
                    {name: 'Zegarek Renata', email: 'renata.zegarek@cevalogistics.com'},
                    {name: 'Rozenfeld - Kiedrowska Angelika', email: 'angelika.rozenfeld@cevalogistics.com'},
                    {name: 'Jan Surwiło', email: 'jan.surwilo@cevalogistics.com'},
                    {name: 'Mandes Janusz', email: 'janusz.mandes@cevalogistics.com'},
                    {name: 'Domański Jarosław', email: 'jaroslaw.domanski@cevalogistics.com'},
                    {name: 'Żach Robert', email: 'robert.zach@cevalogistics.com'},
                    {name: 'Kałuża Iwona', email: 'iwona.kaluza@cevalogistics.com'},
                    {name: 'Grzegorz Oniszczuk', email: 'Grzegorz.Oniszczuk@Cevalogistics.com'},
                    {name: 'Nowak Rafał', email: 'Rafal.Nowak@Cevalogistics.com'},
                    {name: 'Piotr Żebrowski', email: 'Piotr.Zebrowski@Cevalogistics.com'}
                ],
                level3: [
                    {name: 'Wichrowski Piotr', email: 'krzysztof.wilczynski@cevalogistics.com'},
                    {name: 'Kawałek Tomasz', email: 'Tomasz.Kawalek@cevalogistics.com'},
                    {name: 'Wilczyński Krzysztof', email: 'krzysztof.wilczynski@cevalogistics.com'},
                    {name: 'Dominik Haręźlak', email: 'dominik.harezlak@cevalogistics.com'},
                    {name: 'Kasiński Konrad', email: 'konrad.kasinski@cevalogistics.com'},
                    {name: 'Maciąg Mariusz', email: 'mariusz.maciag@cevalogistics.com'},
                    {name: 'Marta Jęznach', email: 'marta.jeznach@cevalogistics.com'}
                ]
            },
            
            // Pytania GEMBA według poziomów i kategorii
            gembaQuestions: {
                'Identyfikacja strat': [
                    {question: 'Jakie najczęstsze przestoje występują na tym stanowisku pracy i jak długo trwają?', levels: [1, 2, 3]},
                    {question: 'Czy widzisz jakieś zbędne ruchy lub przemieszczenia podczas wykonywania zadań?', levels: [1, 2, 3]},
                    {question: 'Ile czasu zajmuje oczekiwanie na materiały, narzędzia lub decyzje?', levels: [2, 3]},
                    {question: 'Czy występują problemy z jakością produktów? Jaki jest poziom braków/poprawek?', levels: [2, 3]},
                    {question: 'Jakie zapasy leżą niewykorzystane i od jak dawna?', levels: [3]},
                    {question: 'Czy są zadania, które wykonujesz, a które uważasz za niepotrzebne?', levels: [1, 2, 3]},
                    {question: 'Gdzie widzisz największe marnotrawstwo czasu w procesie?', levels: [1, 2, 3]}
                ],
                'Analiza przyczyn i rozwiązywanie problemów': [
                    {question: 'Dlaczego ten problem występuje? Co jest jego główną przyczyną?', levels: [1, 2]},
                    {question: 'Czy możesz pokazać mi, jak dokładnie powstaje ten problem?', levels: [1, 2]},
                    {question: 'Jakie działania podjęliście, aby rozwiązać ten problem? Czy przyniosły efekty?', levels: [3]},
                    {question: 'Kto jest zaangażowany w rozwiązywanie problemów na tym obszarze?', levels: [1, 2, 3]},
                    {question: 'Jak dokumentujecie problemy i ich rozwiązania?', levels: [2, 3]},
                    {question: 'jakich używacie narzędzi typu do analizy  problemów?', levels: [2, 3]},
                    {question: 'Skąd wiecie, że problem został trwale rozwiązany?', levels: [2, 3]}
                ],
                'Standaryzacja i optymalizacja': [
                    {question: 'Czy istnieje standardowa instrukcja dla tego procesu? Czy mogę ją zobaczyć?', levels: [1, 2]},
                    {question: 'Jak często aktualizujecie standardy pracy?', levels: [2, 3]},
                    {question: 'Czy wszyscy pracownicy wykonują zadanie w ten sam sposób?', levels: [1, 2]},
                    {question: 'Jakie pomysły na usprawnienia zgłaszali ostatnio pracownicy?', levels: [1, 2]},
                    {question: 'Czy standardy uwzględnią najlepsze znane metody wykonania?', levels: [2, 3]},
                    {question: 'Jak sprawdzacie zgodność pracy ze standardem?', levels: [2, 3]},
                    {question: 'Co można zrobić, aby proces był bardziej efektywny?', levels: [2, 3]},
                    {question: 'Jaki jest główny cel tej instrukcji i dlaczego jest ważne, abyś wykonywał/a ją dokładnie w ten sposób?" ', levels: [1, 2]},
                    {question: 'Gdybyś miał/a wątpliwości co do jakiegoś kroku kroku , co zrobiłbyś/abyś w pierwszej kolejności, aby upewnić się, że robisz to poprawnie', levels: [1, 2]},
                    {question: 'W trakcie tego procesu, który krok niesie ze sobą największe ryzyko błędu lub niezgodności, i jak to minimalizujesz?', levels: [1, 2]},
                    {question: 'Gdybyś zauważył/a, że instrukcja pracy jest nieaktualna lub trudna do wykonania, jaki jest Twój standardowy proces zgłaszania tego?', levels: [1, 2]}
                ],
                'Produktywność i KPI': [
                    {question: 'Jakie wskaźniki KPI monitorujecie na tym obszarze?', levels: [1, 2, 3]},
                    {question: 'Jak często sprawdzacie wyniki i gdzie są one wyświetlane?', levels: [2, 3]},
                    {question: 'Jaki jest cel dzienny/tygodniowy i czy jest osiągany?', levels: [2]},
                    {question: 'Co robicie, gdy wskaźniki są poniżej celu?', levels: [2]},
                    {question: 'Czy pracownicy rozumieją, jak ich praca wpływa na KPI?', levels: [1, 2]},
                    {question: 'Jakie są główne przyczyny nieosiągania celów?', levels: [2, 3]},
                    {question: 'Jak mierzycie produktywność na tym stanowisku?', levels: [2, 3]}
                ],
                'Audyt operacyjny na magazynie, 5S, BHP': [
                    {question: 'Czy wszystkie przedmioty mają wyznaczone i oznaczone miejsca?', levels: [1]},
                    {question: 'Kiedy ostatnio przeprowadzaliście audyt 5S? Jakie były wyniki?', levels: [1]},
                    {question: 'Czy standard sprzątania jest jasno określony i przestrzegany?', levels: [1, 2]},
                    {question: 'Czy wszyscy pracownicy stosują wymagane środki ochrony osobistej?', levels: [1, 2, 3]},
                    {question: 'Czy są zgłaszane wypadki lub sytuacje potencjalnie wypadkowe?', levels: [1]},
                    {question: 'Czy drogi ewakuacyjne są drożne i oznaczone?', levels: [1, 2, 3]},
                    {question: 'Jakie zagrożenia widzisz na tym stanowisku pracy?', levels: [1]},
                    {question: 'Jakie są największe wyzwania w codziennej pracy magazynu?', levels: [1, 2, 3]}
                ]
            },
            
            // Kategorie problemów
            problemCategories: [
                '5S',
                'Bezpieczeństwo',
                'Jakość',
                'Produktywność',
                'Inne'
            ]
        }
        
        // Tutaj dodasz kolejne oddziały, np:
        // 'KRA-PL-02': { ... }
    },
    
    // Domyślny oddział (będzie można zmienić w mobile-index.html)
    defaultBranch: 'ORA-PL-01',
    
    // Funkcje pomocnicze
    getBranch: function(code) {
        return this.branches[code] || this.branches[this.defaultBranch];
    },
    
    getCurrentBranch: function() {
        // Pobierz zapisany oddział z localStorage lub użyj domyślnego
        const savedBranch = localStorage.getItem('ceva_selected_branch');
        return this.getBranch(savedBranch || this.defaultBranch);
    },
    
    setBranch: function(code) {
        if (this.branches[code]) {
            localStorage.setItem('ceva_selected_branch', code);
            return true;
        }
        return false;
    },
    
    // Generowanie nazwy pliku dla audytu
    generateFileName: function(type, zone, date) {
        const branch = this.getCurrentBranch();
        const dateStr = date || new Date().toISOString().split('T')[0];
        const zoneStr = zone.replace(/\s+/g, '');
        return `${type}_${branch.code}_${zoneStr}_${dateStr}.json`;
    },
    
    // Pobierz pytania GEMBA dla wybranego poziomu i kategorii
    getGembaQuestions: function(level, category) {
        const branch = this.getCurrentBranch();
        const questions = branch.gembaQuestions[category];
        if (!questions) return [];
        
        return questions.filter(q => q.levels.includes(level));
    },
    
    // Pobierz uczestników GEMBA dla wybranego poziomu
    getGembaParticipants: function(level) {
        const branch = this.getCurrentBranch();
        const participants = [];
        
        // Dla poziomu 1: tylko poziom 1
        if (level === 1) {
            return [...branch.gembaParticipants.level1];
        }
        // Dla poziomu 2: poziom 1 + poziom 2
        else if (level === 2) {
            return [
                ...branch.gembaParticipants.level1,
                ...branch.gembaParticipants.level2
            ];
        }
        // Dla poziomu 3: wszystkie poziomy
        else if (level === 3) {
            return [
                ...branch.gembaParticipants.level1,
                ...branch.gembaParticipants.level2,
                ...branch.gembaParticipants.level3
            ];
        }
        
        return participants;
    },
    
    // Pobierz kategorie GEMBA
    getGembaCategories: function() {
        const branch = this.getCurrentBranch();
        return Object.keys(branch.gembaQuestions);
    }
};

// Export dla modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CEVA_CONFIG;
}
