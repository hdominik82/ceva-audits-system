// LOADER KONFIGURACJI - WERSJA Z RĘCZNYM POBIERANIEM Z SHAREPOINT
const CONFIG_LOADER = {
    cacheKey: 'ceva_mobile_config',
    
    // SharePoint - folder Config z plikami konfiguracyjnymi
    sharePointBaseUrl: 'https://cevalogisticsoffice365.sharepoint.com/sites/AuditTool',
    configFolderPath: 'Shared%20Documents/Config',
    
    // Dostępne oddziały i ich pliki config
    availableBranches: {
        'ORA-PL-01': {
            code: 'ORA-PL-01',
            name: 'Orange Poland',
            configFileName: 'config_ORA-PL-01.js',
            description: 'CEVA Orange - Polska'
        }
        // Tutaj dodasz kolejne oddziały
    },
    
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
                fullName: 'Wybierz oddział i pobierz konfigurację',
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
    
    // Pobierz URL do pliku config na SharePoint
    getConfigFileUrl: function(branchCode) {
        const branch = this.availableBranches[branchCode];
        if (!branch) return null;
        
        return `${this.sharePointBaseUrl}/${this.configFolderPath}/${branch.configFileName}`;
    },
    
    // Pobierz URL do folderu Config na SharePoint
    getConfigFolderUrl: function() {
        return `${this.sharePointBaseUrl}/${this.configFolderPath}/Forms/AllItems.aspx`;
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
                const parsed = JSON.parse(saved);
                // Dodaj informację o źródle
                parsed._loadedFrom = localStorage.getItem('ceva_config_source') || 'unknown';
                parsed._loadedDate = localStorage.getItem('ceva_config_date') || 'unknown';
                return parsed;
            }
        } catch (e) {
            console.error('Błąd odczytu config:', e);
        }
        return null;
    },
    
    // Zapisz konfigurację
    saveCustomConfig: function(config, source) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(config));
            localStorage.setItem('ceva_config_source', source || 'file');
            localStorage.setItem('ceva_config_date', new Date().toISOString());
            return true;
        } catch (e) {
            console.error('Błąd zapisu config:', e);
            return false;
        }
    },
    
    // Usuń zapisaną konfigurację
    clearCustomConfig: function() {
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem('ceva_config_source');
        localStorage.removeItem('ceva_config_date');
        localStorage.removeItem('ceva_selected_branch');
    },
    
    // Załaduj config (z localStorage lub fallback)
    load: function() {
        const custom = this.getCustomConfig();
        if (custom) {
            console.log('Używam zapisanej konfiguracji');
            return custom;
        }
        console.log('Używam domyślnej konfiguracji');
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
