// KONFIGURACJA SYSTEMU AUDYTÓW CEVA
// Wersja: 2.0 - Multi-branch z SharePoint
// Ostatnia aktualizacja: 2025-10-03

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
            
            // Strefy/obszary w oddziale
            zones: [
                {id: 1, name: 'Inbound', responsible: 'Jan Surwilo', target: 90},
                {id: 2, name: 'Odnowa', responsible: 'Konrad Kasinski', target: 90},
                {id: 3, name: 'Zwroty', responsible: 'Mariusz Maciah', target: 90},
                {id: 4, name: 'B2B', responsible: 'Dominik Harezlak', target: 90},
                {id: 5, name: 'B2C', responsible: 'Patryk Krzeminski', target: 90}
            ],
            
            // Lista audytorów
            auditors: [
                'Jan Surwilo',
                'Konrad Kasinski',
                'Mariusz Maciah',
                'Dominik Harezlak',
                'Patryk Krzeminski'
            ],
            
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
    }
};

// Export dla modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CEVA_CONFIG;
}
