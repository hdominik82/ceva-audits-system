// KONFIGURACJA ODDZIAŁÓW CEVA
// Ten plik umożliwia łatwe dodawanie kolejnych oddziałów w przyszłości

const CEVA_CONFIG = {
    // Aktualnie aktywne oddziały
    branches: {
        'ORA-PL-01': {
            code: 'ORA-PL-01',
            name: 'Orange',
            country: 'PL',
            active: true,
            zones: [
                { id: 1, name: 'Inbound', responsible: 'Jan Surwilo', target: 90 },
                { id: 2, name: 'Odnowa', responsible: 'Konrad Kasinski', target: 90 },
                { id: 3, name: 'Zwroty', responsible: 'Mariusz Maciah', target: 90 },
                { id: 4, name: 'B2B', responsible: 'Dominik Harezlak', target: 90 },
                { id: 5, name: 'B2C', responsible: 'Patryk Krzeminski', target: 90 }
            ],
            auditors: [
                'Jan Surwilo',
                'Konrad Kasinski',
                'Mariusz Maciah',
                'Dominik Harezlak',
                'Patryk Krzeminski'
            ],
            departments: ['Inbound', 'Odnowa', 'Zwroty', 'B2B', 'B2C']
        }
        // Tutaj można dodać kolejne oddziały:
        // 'KRA-PL-02': { ... }
    },

    // Domyślny oddział (używany gdy brak wyboru)
    defaultBranch: 'ORA-PL-01',

    // Wspólne pytania 5S dla wszystkich oddziałów
    fiveS_questions: [
        { category: 1, question: "Czy wszystkie niepotrzebne przedmioty zostały usunięte?" },
        { category: 1, question: "Czy pozostały tylko niezbędne narzędzia?" },
        { category: 2, question: "Czy każdy przedmiot ma wyznaczone miejsce?" },
        { category: 2, question: "Czy wszystkie przedmioty są na swoich miejscach?" },
        { category: 3, question: "Czy obszar jest czysty i uporządkowany?" },
        { category: 3, question: "Czy regularnie przeprowadzane jest sprzątanie?" },
        { category: 4, question: "Czy istnieją standardy organizacji?" },
        { category: 4, question: "Czy standardy są widoczne i zrozumiałe?" },
        { category: 5, question: "Czy pracownicy stosują się do standardów?" },
        { category: 5, question: "Czy przeprowadzane są audyty?" }
    ],

    // Kategorie GEMBA - wspólne dla wszystkich
    gemba_categories: [
        'BHP',
        'Jakość',
        '5S',
        'Standard Pracy',
        '7 Strat LEAN',
        'Inne'
    ],

    // 7 strat LEAN
    lean_wastes: [
        'Nadprodukcja',
        'Oczekiwanie',
        'Transport',
        'Nadmierne przetwarzanie',
        'Zapasy',
        'Ruchy',
        'Wady'
    ],

    // Kategorie problemów
    problem_categories: [
        'BHP',
        'Jakość',
        '5S',
        'Proces',
        'Sprzęt',
        'IT',
        'Inne'
    ],

    // Poziomy priorytetu
    priority_levels: [
        { value: 'Niski', color: '#28a745' },
        { value: 'Średni', color: '#ffc107' },
        { value: 'Wysoki', color: '#ff9800' },
        { value: 'Krytyczny', color: '#dc3545' }
    ],

    // Wersja konfiguracji (do śledzenia zmian)
    version: '1.0',
    lastUpdate: '2025-01-02'
};

// Funkcja pomocnicza - pobierz konfigurację oddziału
function getBranchConfig(branchCode) {
    return CEVA_CONFIG.branches[branchCode] || CEVA_CONFIG.branches[CEVA_CONFIG.defaultBranch];
}

// Funkcja pomocnicza - pobierz aktywny oddział z localStorage lub domyślny
function getActiveBranch() {
    const stored = localStorage.getItem('activeBranch');
    return stored || CEVA_CONFIG.defaultBranch;
}

// Funkcja pomocnicza - ustaw aktywny oddział
function setActiveBranch(branchCode) {
    if (CEVA_CONFIG.branches[branchCode]) {
        localStorage.setItem('activeBranch', branchCode);
        return true;
    }
    return false;
}

// Export dla użycia w innych plikach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CEVA_CONFIG;
}
