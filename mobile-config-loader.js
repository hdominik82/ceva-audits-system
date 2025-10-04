// LOADER KONFIGURACJI - WERSJA Z RĘCZNYM WGRYWANIEM
const CONFIG_LOADER = {
    cacheKey: 'ceva_mobile_config',
    
    // Podstawowa konfiguracja (używana póki użytkownik nie wgra własnej)
    fallbackConfig: {
        sharePointSite: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
        sharePointDocuments: 'Shared%20Documents',
        folders: {
            fiveS: '5S',
            gemba: 'Gemba',
            process: 'Process',
            problems: 'Problems'
        },
        branches: {
            'DEFAULT': {
                code: 'DEFAULT',
                name: 'Domyślny',
                country: 'PL',
                fullName: 'CEVA - Wgraj konfigurację',
                sharePointFolder: 'DEFAULT',
                zones: [{id: 1, name: 'Strefa', responsible: 'Manager', target: 90}],
                auditors: ['Auditor'],
                problemCategories: ['5S', 'Bezpieczeństwo', 'Jakość', 'Produktywność', 'Inne'],
                processesByDepartment: {},
                instructions: []
            }
        },
        defaultBranch: 'DEFAULT',
        getBranch: function(code) {
            return this.branches[code] || this.branches[this.defaultBranch];
        },
        getCurrentBranch: function() {
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
        generateFileName: function(type, zone, date) {
            const branch = this.getCurrentBranch();
            const dateStr = date || new Date().toISOString().split('T')[0];
            const zoneStr = zone.replace(/\s+/g, '');
            return `${type}_${branch.code}_${zoneStr}_${dateStr}.json`;
        },
        getSharePointFolderUrl: function(branchCode, folderType) {
            const branch = this.branches[branchCode];
            if (!branch) return this.sharePointSite;
            const folderName = this.folders[folderType];
            return `${this.sharePointSite}/${this.sharePointDocuments}/Forms/AllItems.aspx?id=%2Fsites%2FAuditTool%2F${this.sharePointDocuments}%2F${branch.sharePointFolder}%2F${folderName}`;
        }
    },
    
    // Sprawdź czy jest zapisana konfiguracja
    hasCustomConfig: function() {
        return localStorage.getItem(this.cacheKey) !== null;
    },
    
    // Pobierz zapisaną konfigurację
    getCustomConfig: function() {
        try {
            const saved = localStorage.getItem(this.cacheKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Błąd odczytu config:', e);
        }
        return null;
    },
    
    // Zapisz konfigurację
    saveCustomConfig: function(config) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(config));
            return true;
        } catch (e) {
            console.error('Błąd zapisu config:', e);
            return false;
        }
    },
    
    // Usuń zapisaną konfigurację
    clearCustomConfig: function() {
        localStorage.removeItem(this.cacheKey);
    },
    
    // Załaduj config (z localStorage lub fallback)
    load: function() {
        const custom = this.getCustomConfig();
        if (custom) {
            console.log('Używam zapisanej konfiguracji');
            return custom;
        }
        console.log('Używam domyślnej konfiguracji - wgraj plik config.js');
        return this.fallbackConfig;
    },
    
    // Wczytaj config z pliku wybranego przez użytkownika
    loadFromFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    
                    // Usuń kod JavaScript, zostaw tylko obiekt
                    let configCode = content
                        .replace(/const\s+CEVA_CONFIG\s*=\s*/, '')
                        .replace(/if\s*\(typeof\s+module[\s\S]*$/, '')
                        .trim();
                    
                    if (configCode.endsWith(';')) {
                        configCode = configCode.slice(0, -1);
                    }
                    
                    // Parsuj do obiektu
                    const config = eval(`(${configCode})`);
                    
                    // Walidacja podstawowa
                    if (!config.branches || !config.defaultBranch) {
                        throw new Error('Nieprawidłowy format pliku config.js');
                    }
                    
                    resolve(config);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Błąd odczytu pliku'));
            };
            
            reader.readAsText(file);
        });
    }
};

// Globalny obiekt CEVA_CONFIG (będzie nadpisany po załadowaniu)
let CEVA_CONFIG = CONFIG_LOADER.load();
